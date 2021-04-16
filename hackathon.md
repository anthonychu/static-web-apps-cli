# Python Hackathon

## Assumptions

Currently we make a bunch of assumptions about the project structure. Create a folder for your frontend app at the root of the repo. You can name it anything you want:

```
/
  web/
  | index.html
  | (other files)
```

The API currently must be in `api/`.

## Install tools

- Azure Static Web Apps CLI - Install a build that includes changes for this hackathon

  ```
  npm i -g git+https://github.com/anthonychu/static-web-apps-cli.git#py-hack
  ```

- Azure Functions Core Tools

  ```
  npm i -g azure-functions-core-tools@3 --unsafe-perm true
  ```

- VS Code with Azure Static Web Apps extension

## Create api folder

1. Before starting, create a Python virtual env at the root of the repo.

   ```
   python -m venv .venv
   source .venv/bin/activate
   ```

1. Run this Static Web Apps CLI command to scaffold the `api/` folder.

   ```
   swa init-api --python
   ```

   In the `api/` folder, there's a `main.py` which holds the entry point for a FastAPI app. Add more endpoints here.

   Put any additional dependencies into `requirements.txt`.

   ```
   /
   .venv/
   api/
   | main.py
   | requirements.txt
   web/
   | index.html
   | (other files)
   ```

1. Start the app using the CLI (replace `web` with the name of the folder with your frontend app, use `swa --help` for more ways to start the app).

   ```
   swa start web --api api
   ```

   Open the app at `http://localhost:4280/`. The APIs are accessible at `http://localhost:4280/api/hello`.

## Deployment

1. To deploy the site, first push it to GitHub.

1. In the Azure portal, create an Azure Static Web App.

   - Log into your GitHub account
   - Select the repo and branch
   - Use these settings to deploy
     - `app_location`: `web` (or whatever the folder is called)
     - `api_location`: `api`
     - `output_location`: `""` - if the app needs to be built first, set this to the output folder. This is relative to `app_location` (e.g., React is usually `build`)

1. Create the static web app.

1. It will fail the first time because you need to be using an updated version of the Static Web Apps GitHub action.

   - There should be a workflow created in your repo in `.github/workflows`. Open it and update `azure/static-web-apps-deploy@v0.0.1-preview` to `anthonychu/static-web-apps-deploy@v0.0.1-preview`

1. Commit the updated workflow and the build should now pass.
