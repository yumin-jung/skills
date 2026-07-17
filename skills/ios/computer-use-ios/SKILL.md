---
name: computer-use-ios
description: Control the iOS Simulator headlessly via simctl + idb (screenshots, tap, swipe, text). Use this INSTEAD of a computer-use / screen-control MCP whenever the target is a simulator — no mouse takeover, no focus stealing, works even if the sim window is hidden or on another monitor.
---

# iOS Simulator control (simctl + idb)

Never drive the iOS Simulator with a computer-use / screen-control tool (real mouse + screenshots of the whole desktop). Use this recipe instead. Computer-use is only for UI outside the simulator (real-device mirroring, Xcode dialogs, etc.).

## Prerequisites

```bash
brew install idb-companion
pip3 install fb-idb
```

`idb` installs into your Python bin directory, which may not be on PATH. Find it and export:

```bash
# e.g. python.org framework install:
export PATH="/Library/Frameworks/Python.framework/Versions/3.13/bin:$PATH"
# or: export PATH="$(python3 -m site --user-base)/bin:$PATH"
```

## Find / boot a device

```bash
xcrun simctl list devices booted          # get UDID
xcrun simctl boot <UDID>                  # boot if none (open -a Simulator only if you need the window visible — not required)
```

Use the UDID explicitly in every command; `booted` is ambiguous when a real device is also connected (idb lists both).

## Screenshot → look → act loop

```bash
xcrun simctl io <UDID> screenshot shot.png   # then view shot.png
```

Screenshot is in **pixels**; idb coordinates are in **points**. Divide px by the device scale (@3x on iPhone Pro models → px ÷ 3, @2x → ÷ 2). If your harness displays the image resized, convert to original px first, then ÷ scale.

## Interact (idb, coordinates in pt)

```bash
idb ui tap   --udid <UDID> <x> <y>
idb ui swipe --udid <UDID> <x1> <y1> <x2> <y2> --duration 0.3   # scrolling = swipe; there is no wheel
idb ui text  --udid <UDID> "hello"        # hardware-keyboard path — immune to the on-screen keyboard's language layout
idb ui key   --udid <UDID> 40             # HID keycode (40 = Return)
```

After each action: sleep ~1s, re-screenshot, verify. Don't chain taps blind.

## App lifecycle / shortcuts (simctl, faster than tapping)

```bash
xcrun simctl launch <UDID> <bundle-id>
xcrun simctl terminate <UDID> <bundle-id>
xcrun simctl openurl <UDID> "myapp://deeplink"
xcrun simctl io <UDID> recordVideo out.mp4   # ctrl-c to stop
```

## Gotchas

- Tap target off by a bit → you probably forgot px→pt conversion.
- `idb` cold-starts a companion per UDID on first use; first command may take a few seconds.
- Text lands wherever focus is — tap the field first, verify the cursor/keyboard appeared, then `ui text`.
- Simulator window visibility, monitor placement, and macOS focus are all irrelevant — never switch displays or bring Simulator forward for this.
