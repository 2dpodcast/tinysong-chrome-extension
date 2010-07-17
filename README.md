# Tinysong Chrome Extension

Create music links that make it easy to share music for free with your friends. The Tinysong Chrome Extension helps you find short URLs for sharing songs online directly from Google Chrome.

By default, all links will be opened in Grooveshark Desktop (gs://). This can be changed in the extension's settings.


## Installation

You can install the extension via the [Google Chrome Extensions Gallery][gallery].


## Known issues

As of right now, a "copy to clipboard" functionality cannot be provided due to restrictions in Chrome's security policy.

Google does offer an experimental API to copy elements to the clipboard, but use of this API would only work if users start their browsers with the __--enable-experimental-extension-apis__ flag. Furthermore, extensions using experimental APIs can't be uploaded to the extension gallery.

Once this API moves from experimental to supported, "copy to clipboard" will be added.


## Problems?

Please open [an issue][issues].


## Author

* Dominik Habersack / <dhabersack@gmail.com>


## License

The Tinysong Chrome Extension is released under the [MIT License][license].


[gallery]: https://chrome.google.com/extensions/detail/akbgkodpohdncofgocdjnjloihlabicp
[issues]: http://github.com/dhabersack/tinysong-chrome-extension/issues
[license]: http://github.com/dhabersack/tinysong-chrome-extension/blob/master/LICENSE
