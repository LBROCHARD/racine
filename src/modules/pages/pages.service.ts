import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageDto } from 'src/dtos/createPage.dto';
import { UpdatePageDto } from 'src/dtos/updatePage.dto';
import { UpdatePageContentDto } from 'src/dtos/updatePageContent.dto';
import { DeletePageDto } from 'src/dtos/deletePage.dto';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  async getPageFromId(userId: string, pageId: string) {
    // Check if the user and the page exist
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const page = await this.prisma.page.findUnique({
      where: { id: pageId },
    });
    if (!user) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    } else if (!page) {
      throw new HttpException('Page not found.', HttpStatus.NOT_FOUND);
    }

    // Check if the user and the page are both part of the same group
    const groupPage = await this.prisma.groupPage.findFirst({
      where: { pageId: page.id },
    });
    if (!groupPage) {
      throw new HttpException(
        'This Page is not part of any group.',
        HttpStatus.NOT_FOUND,
      );
    }
    const groupMember = await this.prisma.groupMember.findFirst({
      where: { groupId: groupPage.groupId, userId: user.id },
    });
    if (!groupMember) {
      throw new HttpException(
        "This User can't access this page.",
        HttpStatus.NOT_FOUND,
      );
    }

    return await this.prisma.page.findUnique({ where: { id: pageId } });
  }

  async getAllPagesFromGroupId(userId: string, groupId: string) {
    // Check if the user and the group exist
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });
    if (!user) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    } else if (!group) {
      throw new HttpException('Group not found.', HttpStatus.NOT_FOUND);
    }

    // Check if the user is part of the  group
    const groupMember = await this.prisma.groupMember.findFirst({
      where: { groupId: group.id, userId: user.id },
    });
    if (!groupMember) {
      throw new HttpException(
        'You are not a part of this group.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const groupPages = await this.prisma.groupPage.findMany({
      where: {
        groupId: group.id,
      },
      include: {
        page: true,
      },
    });

    return groupPages.map((groupPage) => groupPage.page);
  }

  async createPage(creatorId: string, createPageDto: CreatePageDto) {
    const group = await this.prisma.group.findUnique({
      where: { id: createPageDto.groupId },
    });
    const user = await this.prisma.user.findUnique({
      where: { id: creatorId },
    });

    if (!group) {
      throw new HttpException('Group not found.', HttpStatus.NOT_FOUND);
    } else if (!user) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    const groupMember = await this.prisma.groupMember.findFirst({
      where: { groupId: group.id, userId: user.id },
    });

    if (!groupMember) {
      throw new HttpException(
        'This User is not a part of the group you want to create a page in.',
        HttpStatus.NOT_FOUND,
      );
    }

    const newPage = await this.prisma.page.create({
      data: {
        groupId: createPageDto.groupId,
        pageName: createPageDto.pageName,
        pageColor: createPageDto.pageColor,
        content: '',
        tags: createPageDto.tags,
      },
    });

    // Create a groupPage for all page created, because a page is always part of a group
    await this.prisma.groupPage.create({
      data: {
        groupId: group.id,
        pageId: newPage.id,
      },
    });
    return newPage;
  }

  // Modify the page informations
  async modifyPage(userId: string, updatePageDto: UpdatePageDto) {
    // Check if the user, the group and the page exist
    const group = await this.prisma.group.findUnique({
      where: { id: updatePageDto.groupId },
    });
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const page = await this.prisma.page.findUnique({
      where: { id: updatePageDto.pageId },
    });
    if (!group) {
      throw new HttpException('Group not found.', HttpStatus.NOT_FOUND);
    } else if (!user) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    } else if (!page) {
      throw new HttpException('Page not found.', HttpStatus.NOT_FOUND);
    }

    // Check if the user and the page are part of that group
    const groupMember = await this.prisma.groupMember.findFirst({
      where: { groupId: group.id, userId: user.id },
    });
    if (!groupMember) {
      throw new HttpException(
        'This User is not a part of that group.',
        HttpStatus.NOT_FOUND,
      );
    }
    const groupPage = await this.prisma.groupPage.findFirst({
      where: { groupId: group.id, pageId: page.id },
    });
    if (!groupPage) {
      throw new HttpException(
        'The Page you want to modify is not a part of the Group you specified.',
        HttpStatus.NOT_FOUND,
      );
    }

    return await this.prisma.page.update({
      where: { id: page.id },
      data: {
        pageName: updatePageDto.pageName,
        pageColor: updatePageDto.pageColor,
        tags: updatePageDto.pageTags,
      },
    });
  }

  // Update the page content
  async updatePageContent(
    userId: string,
    updatePageContentDto: UpdatePageContentDto,
  ) {
    // Check if the user, the group and the page exist
    const group = await this.prisma.group.findUnique({
      where: { id: updatePageContentDto.groupId },
    });
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const page = await this.prisma.page.findUnique({
      where: { id: updatePageContentDto.pageId },
    });
    if (!group) {
      throw new HttpException('Group not found.', HttpStatus.NOT_FOUND);
    } else if (!user) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    } else if (!page) {
      throw new HttpException('Page not found.', HttpStatus.NOT_FOUND);
    }

    // Check if the user and the page are part of that group
    const groupMember = await this.prisma.groupMember.findFirst({
      where: { groupId: group.id, userId: user.id },
    });
    if (!groupMember) {
      throw new HttpException(
        'This User is not a part of that group.',
        HttpStatus.NOT_FOUND,
      );
    }
    const groupPage = await this.prisma.groupPage.findFirst({
      where: { groupId: group.id, pageId: page.id },
    });
    if (!groupPage) {
      throw new HttpException(
        'The Page you want to modify is not a part of the Group you specified.',
        HttpStatus.NOT_FOUND,
      );
    }

    return await this.prisma.page.update({
      where: { id: page.id },
      data: {
        content: updatePageContentDto.pageContent,
      },
    });
  }

  async deletePage(creatorId: string, deletePageDto: DeletePageDto) {
    // Check if the user, the group and the page exist
    const group = await this.prisma.group.findUnique({
      where: { id: deletePageDto.groupId },
    });
    const user = await this.prisma.user.findUnique({
      where: { id: creatorId },
    });
    const page = await this.prisma.page.findUnique({
      where: { id: deletePageDto.pageId },
    });
    if (!group) {
      throw new HttpException('Group not found.', HttpStatus.NOT_FOUND);
    } else if (!user) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    } else if (!page) {
      throw new HttpException('Page not found.', HttpStatus.NOT_FOUND);
    }

    // Check if the user and the page are part of that group
    const groupMember = await this.prisma.groupMember.findFirst({
      where: { groupId: group.id, userId: user.id },
    });
    if (!groupMember) {
      throw new HttpException(
        'This User is not a part of that Group.',
        HttpStatus.NOT_FOUND,
      );
    }
    const groupPage = await this.prisma.groupPage.findFirst({
      where: { groupId: group.id, pageId: page.id },
    });
    if (!groupPage) {
      throw new HttpException(
        'The Page you want to delete is not a part of the Group you specified.',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.groupPage.deleteMany({
      where: { pageId: page.id },
    });

    return await this.prisma.page.delete({
      where: { id: page.id },
    });
  }
}
