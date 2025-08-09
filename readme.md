# The Application Lab Website

This repository contains the source code for The Application Lab website, live at [theapplicationlab.com](https://theapplicationlab.com). 

## Running Locally

To run the website locally for development, ensure you have the required prerequisites and follow these steps.

### Prerequisites

*   [Hugo (Extended version)](https://gohugo.io/installation/): v0.147.7 or later
*   [Node.js](https://nodejs.org/): v22.16.0 or later (which includes npm)
*   [Go](https://go.dev/doc/install): v1.24.3 or later

### Local Setup

1.  **Clone the repository:**

2.  **Install dependencies:**
    This project uses Node.js to manage development tools and dependencies.
    ```bash
    npm install
    ```

3.  **Run the development server:**
    This command starts Hugo's local server with live-reloading. The site will be available at `http://localhost:1313/`.
    ```bash
    npm run dev
    ```

## Available Scripts

This project uses `npm` to manage common tasks:

*   `npm run dev`: Starts the Hugo development server for local development.
*   `npm run build`: Creates a production-ready build of the site in the `/public` directory.
*   `npm run build-preview`: Builds a minified version of the site and serves it locally for previewing.
*   `npm run og-images`: Runs the script to generate Open Graph images for social sharing.


## License

The website's theme and code are licensed under the MIT License. See the License file for more details. Content contributed to the site is shared under the same license unless otherwise specified.

___

_Site built by [adh1b](https://github.com/adh1b)_