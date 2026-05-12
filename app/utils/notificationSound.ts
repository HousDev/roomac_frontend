// src/utils/notificationSound.ts

import { Howl, Howler } from "howler";
import notificationSoundFile from "@/app/src/assets/sounds/notification.mp3";

let sound: Howl | null = null;
let initialized = false;
let unlocked = false;

export const initNotificationSound = async () => {
  try {
    // Resume browser audio context
    if (Howler.ctx.state !== "running") {
      await Howler.ctx.resume();
    }

    // Create sound once
    if (!sound) {
      sound = new Howl({
        src: [notificationSoundFile],
        volume: 0.7,
        preload: true,
      });
    }

    unlocked = true;
    initialized = true;

    console.log("🔊 Notification sound unlocked");
  } catch (err) {
    console.error("Audio unlock failed:", err);
  }
};

export const playNotificationSound = async () => {
  try {
    if (!initialized || !unlocked) {
      console.log("🔇 Audio not unlocked yet");
      return;
    }

    if (!sound) return;

    // Restart sound cleanly
    sound.stop();
    sound.seek(0);

    await sound.play();

    console.log("🔔 Playing notification sound");
  } catch (err) {
    console.error("Play sound error:", err);
  }
};

export const preloadNotificationSound = () => {
  if (!sound) {
    sound = new Howl({
      src: [notificationSoundFile],
      volume: 0.7,
      preload: true,
    });
  }
};

export const setNotificationVolume = (volume: number) => {
  if (sound) {
    sound.volume(Math.max(0, Math.min(1, volume)));
  }
};