import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/dtos/createUser.dto';
import * as bcrypt from 'bcrypt';
import { GroupService } from '../group/group.service';
import { PagesService } from '../pages/pages.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private groupService: GroupService,
    private pagesService: PagesService,
    private jwtService: JwtService,
  ) {}

  async signIn(createUserDto: CreateUserDto): Promise<{
    access_token: string;
    username: string;
    email: string;
    id: string;
  }> {
    const user = await this.usersService.findOneUserByEmail(
      createUserDto.email,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatching = await bcrypt.compare(
      createUserDto.password,
      user.password,
    );
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { id: user.id, username: user.username, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      username: payload.username,
      email: payload.email,
      id: payload.id,
    };
  }

  async signUp(createUserDto: CreateUserDto) {
    const usernameExist = await this.usersService.findOneUserByUsername(
      createUserDto.username,
    );
    if (usernameExist) {
      throw new BadRequestException('Username already exists');
    }

    const emailExist = await this.usersService.findOneUserByEmail(
      createUserDto.email,
    );
    if (emailExist) {
      throw new BadRequestException('Email already used for an account');
    }

    const user = await this.usersService.createUser(createUserDto);

    // Before creating a user, auto create a first group with a fist page
    const group = await this.groupService.createGroup(user.id, {
      groupName: 'Welcome group',
      groupColor: '#6CAB77',
    });

    const page = await this.pagesService.createPage(user.id, {
      groupId: group.id,
      pageName: 'Welcome Page',
      pageColor: '2E4580',
      tags: 'default_page tutorial',
    });

    await this.pagesService.updatePageContent(user.id, {
      groupId: group.id,
      pageId: page.id,
      pageContent: `# Welcome!

  Welcome to Super Notes! 

  ## What is this?

  **Super Notes** is a collaborative note-taking application using the Markdown format.

  ## What can it do?

  Super Notes, in its current version, has multiple features :

  - create an account 
  - login 
  - list all groups associated with the account in a retractable sidebar
  - create groups
  - modify and delete groups
  - add members to a group (letting them access its content)
  - remove members from a group
  - create pages with a title, a background color and tags
  - modify and delete pages
  - use the search bar to sort pages from titles *and* tags
  - modify the content of a page with a Markdown text editor
  - read the page content formatted from Markdown into HTML

  ## What to do now?

  You can explore, create accounts, groups, and pages and test the markdown editor!

  ### Tips : You can edit a page by clicking the "Edit Mode" button! 

`,
    });

    return user;
  }
}
