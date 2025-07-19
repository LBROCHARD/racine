module.exports = {
    ci: {
        collect: {
            "startServerCommand": "npm run start",
            "startServerReadyPattern": "Local:",
            "url": [
                "http://localhost:3000/",
            ],
            "numberOfRuns": 1
        },
        upload: {
            "target": "filesystem",
			"outputDir": "./.lighthouseci/reports"
        },
        "assert": {
			"assertions": {
				"accessibility": "warn",
				"performance": "warn",
				"seo": "warn",
				"best-practices": "warn"
			}
		}
    },
};
