
## Installation

1. Clone the repository or download the source code.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" by toggling the switch in the top right corner.
4. Click on "Load unpacked" and select the directory containing the extension's source code.

## Usage

1. Click on the extension icon to open the popup.
2. Use the "Add Tab" button to add the current active tab to the focus group.
3. Use the "Reset" button to clear the focus group.
4. Tabs in the focus group will be displayed in a list with a cancel button to remove individual tabs.

## Code Overview

### `index.html`

The main HTML file that defines the structure of the extension's popup.

### `script.js`

JavaScript file that interacts with the DOM and manages the focus group functionality.

#### Functions

- `addDOMTabs(savedTabArray, urlStemArray)`: Adds tabs to the DOM based on the saved arrays.
- `createTabGroup(tabIds, title, color)`: Creates a new tab group with the specified tabs.
- `removeTabFromGroup(tabIds)`: Removes tabs from the group.

### `manifest.json`

Defines the extension's metadata and permissions.

### `background.js`

Handles background tasks for the extension.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Feel free to submit issues or pull requests if you have any improvements or bug fixes.

## Contact

For any questions or suggestions, please contact [your-email@example.com].
