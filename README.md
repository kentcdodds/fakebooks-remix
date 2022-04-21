# Remix Fakebooks App

This is a (very) simple implementation of the fakebooks mock app demonstrated on [remix.run](https://remix.run). There is no database, but there is an arbitrary delay of 40-100ms whenever accessing "invoice data" to simulate querying a real database.

This inteded to be used to compare from a fairly standard client-rendered app. The sister repo to this one can be found at [kentcdodds/fakebooks-cra](https://github.com/kentcdodds/fakebooks-cra).

- [Fakebooks Remix Production Deploy](https://fakebooks-remix-1b16.fly.dev/sales/invoices) - Deployed on Fly in the Dallas Region
- [Fakebooks CRA Production Deploy](https://fakebooks-cra.netlify.app/sales/invoices) - Deployed on Netlify's global CDN

The main objective of this comparison (currently) is to demonstrate the UX and DX difference between the two approaches in regards to data loading. Test out the initial page load as well as switching between different pages.

Please do dig into the code and compare the level of complexity. Keep in mind that a CRA app is only half the story. You need a backend. This Remix app's backend is used to handle that for the CRA version.

Another thing to keep in mind is that this app doesn't handle mutations (yet?). Adding mutation support would drastically complicate the CRA implementation, but would be a pretty simple thing to handle for Remix.
