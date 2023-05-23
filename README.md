# sealjay-blog
> The code behind the Azure Static Website blog hosted at sealjay.com.

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
![GitHub issues](https://img.shields.io/github/issues/Sealjay/sealjay-blog)
![GitHub](https://img.shields.io/github/license/Sealjay/sealjay-blog)
![GitHub Repo stars](https://img.shields.io/github/stars/Sealjay/sealjay-blog?style=social)
[![TypeScript](https://img.shields.io/badge/--3178C6?logo=typescript&logoColor=ffffff)](https://www.typescriptlang.org/)
[![JavaScript](https://img.shields.io/badge/--3178C6?logo=javascript&logoColor=ffffff)](https://nodejs.org/en/)
[![Azure](https://img.shields.io/badge/--3178C6?logo=microsoftazure&logoColor=ffffff)](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/?WT.mc_id=AI-MVP-5004204)
[![NextJS](https://img.shields.io/badge/--3178C6?logo=next.js&logoColor=ffffff)](https://nextjs.org/)

## Overview
This website hosts my private blog posts, which were previously hosted on a Docker instance of Ghost.

This repository is designed to be compiled and deployed to [Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/deploy-nextjs?WT.mc_id=AI-MVP-5004204).


## Licensing
### Source code
The source code in this project is licensed under the the [MIT Licence](./LICENCE).and is freely available to End Users.
### Underlying site content
The underlying site template is a commercial product and is licensed under the [Tailwind UI license](https://tailwindui.com/license). Changes and additions are licenced under the MIT licence, as an End Product released open source and freely available to End Users.
### Blog content itself
**Importantly** except where I'm using other peoples work with permission, all content within the blog is copyright &copy; 2018-2023 Chris Lloyd-Jones, under the name Sealjay(R).

Whilst all the content is copyright, it is licenced under the [Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0/). This means you are free to share and adapt the content for any purpose, as long as you give appropriate credit, provide a link to the licence, and indicate if changes were made. If you remix, transform, or build upon the material, you must distribute your contributions under the same licence as the original.

## Solutions Referenced
- [Azure Static Web App CLI](https://azure.github.io/static-web-apps-cli/docs/use/install?&WT.mc_id=AI-MVP-500420)


## Getting started with this repository
You can use a [dev container](https://docs.microsoft.com/en-us/azure-sphere/app-development/container-build-vscode?&WT.mc_id=AI-MVP-500420) to run this in VS Code, or in [GitHub codespaces](https://github.com/features/codespaces).

To get started, first install the [Azure Static Web App CLI](https://azure.github.io/static-web-apps-cli/docs/use/install), and make sure you have nodejs installed.

### Run the development server:

```bash
swa start
```

Finally, open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

## Contact
Feel free to contact me [on Twitter](https://twitter.com/sealjay_clj). For bugs, please [raise an issue on GitHub](https://github.com/Sealjay/sealjay-blog/issue).

## Contributing
Contributions are more than welcome! This repository uses [GitHub flow](https://guides.github.com/introduction/flow/) - with [Commitizen](https://github.com/commitizen/cz-cli#making-your-repo-commitizen-friendly) to enforce semantic commits (`npm install -g commitizen cz-customizable`, `echo '{ "path": "cz-customizable" }' > ~/.czrc`, and then `git cz`- easy to setup!)

**Note: This adds a .czrc file to your home directory, and will overwrite existing commitzen .czrc files.**