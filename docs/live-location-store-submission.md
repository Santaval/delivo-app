# Live driver location: store declarations and privacy policy

The live route tracking (issue #53) sends the assigned driver's position while a
route is `STARTED`, **including when the app is in the background**. That needs a
new native build (EAS) and has store-review consequences. Complete the items
below **before the first release containing this feature**.

## What the app does (for the reviewers)

- Only the user assigned to the route (`DEALER`, `ADMIN` or `OWNER`) shares their position.
- Sharing starts when that user starts the route and stops when the route is
  completed, reassigned, or the user pauses it from the "Sharing location" banner.
- While sharing in the background: Android shows a persistent foreground-service
  notification; iOS shows the system blue location indicator.
- Only `OWNER`/`ADMIN` of the company (and the driver) can read the position. A
  `DEALER` cannot see other drivers.
- Only the latest position is stored, and it is deleted when the route completes
  or the driver is changed.

## Google Play: background location declaration

Play Console > App content > Sensitive app permissions > Location permissions.

1. Declare `ACCESS_BACKGROUND_LOCATION` and the foreground service type `location`
   (`FOREGROUND_SERVICE_LOCATION`).
2. Core feature to describe: "Live tracking of a delivery route so the company's
   administrators can follow the driver's progress. The location is shared only
   while a route is active and the driver sees a persistent notification."
3. Upload the **demo video** (public/unlisted link) showing, in order:
   - The in-app prominent disclosure (Alert "Share your location during the route").
   - The system permission dialog and choosing "Allow all the time".
   - Starting a route, locking the phone, and the foreground-service notification.
   - An admin on another device seeing the marker move.
   - Completing the route and the notification disappearing.
4. The in-app disclosure texts live in `i18n/locales/{es,en}.json`
   (`trackingBackgroundRationale*`); keep them consistent with the declaration.

## Apple App Review: "Always" location

- Usage strings (`NSLocationAlwaysAndWhenInUseUsageDescription`,
  `NSLocationAlwaysUsageDescription`) are in `app.json` (Spanish, default) and
  `locales/{es,en}.json` (localized InfoPlist). They state that the location is
  used **only during an active route**. Reviewers read them, so keep them accurate.
- `UIBackgroundModes: ["location"]` is enabled; mention it in the App Review notes
  with demo credentials and steps: start a route as a driver, grant "Always", lock
  the phone, watch the position on a second account.
- App Privacy ("nutrition label"): declare **Precise Location**, linked to the
  user's identity, purpose **App Functionality**, not used for tracking/ads.

## Privacy policy (published at the URL in `config.privacyUrl`)

Add to the policy:

- That precise location is collected **in the background**, only while the user has
  an active route, to share it with the administrators of their own company.
- Who can see it (driver, OWNER/ADMIN of the company) and that it is not shared
  with third parties or used for advertising.
- Retention: only the latest position is kept; it is removed when the route is
  completed or the driver is reassigned. Not part of the user's history.
- How to stop: pause from the "Sharing location" banner, revoke the permission in
  the system settings, or complete/unassign the route.

## Release checklist

- [ ] New EAS build (not OTA): native config and `expo-task-manager` changed.
- [ ] Play background-location form approved and video uploaded.
- [ ] App Store usage strings reviewed, App Privacy updated.
- [ ] Privacy policy updated and live.
- [ ] Manual device test: Android (foreground service) and iOS (blue indicator),
      locked screen, airplane-mode recovery, route completion stops tracking.
