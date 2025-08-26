import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate", // auto updates service worker
      manifest: {
        name: "My Vite PWA",
        short_name: "MyApp",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
          {
            src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjM2qefiJQAAAEBJREFUeJztwTEBAAAAwqD1T20ND6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPA5AxUAAZg2VcgAAAAASUVORK5CYII=",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjM2qefiJQAAAEBJREFUeJztwTEBAAAAwqD1T20ND6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPA5AxUAAZg2VcgAAAAASUVORK5CYII=",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
