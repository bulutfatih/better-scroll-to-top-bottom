# Better Scroll to Top/Bottom

A Chrome extension that adds buttons to scroll to the top and bottom of the page.

## Features

- Adds scroll to top and bottom buttons to any webpage
- Customizable position, size, and appearance
- Smooth or instant scrolling options
- Buttons automatically hide when not needed
- Configurable opacity and hover effects

## Development

This extension is built with TypeScript and uses Biome.js for code formatting and linting.

### Prerequisites

- Node.js and npm

### Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

### Build

To build the extension:

```bash
npm run build
```

This will:

1. Compile TypeScript files
2. Copy static assets to the `dist` directory

### Development Workflow

- Use `npm run watch` to automatically recompile TypeScript files when they change
- Use `npm run format` to format code with Biome.js
- Use `npm run lint` to check for linting issues
- Use `npm run check` to check for code issues

### Loading the Extension in Chrome

1. Build the extension using `npm run build`
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `dist` directory
5. The extension should now be loaded and active

## Options

The extension provides several customization options:

- **Position**: Choose from 6 positions on the screen
- **Offset**: Distance from the edge of the screen
- **Vertical Spacing**: Space between the buttons
- **Opacity**: Default opacity of the buttons
- **Hover Opacity**: Opacity when hovering over the buttons
- **Scroll Behavior**: Smooth or instant scrolling
- **Button Size**: Size of the buttons

## License

MIT
