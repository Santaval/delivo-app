module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...config.plugins.filter((p) => {
      const name = Array.isArray(p) ? p[0] : p;
      return name !== 'react-native-maps';
    }),
    [
      "@rnmapbox/maps",
      {
        RNMapboxMapsVersion: "11.8.0",
        RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOADS_TOKEN,
      },
    ],
  ],
});
