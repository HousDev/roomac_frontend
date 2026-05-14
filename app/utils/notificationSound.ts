// src/utils/notificationSound.ts

import { Howl, Howler } from "howler";
import notificationSoundFile from "@/app/src/assets/sounds/notification.mp3";

let sound: Howl | null = null;
let initialized = false;
let unlocked = false;
let pendingPlay: (() => void) | null = null;

export const initNotificationSound = async () => {
  try {
    // Create sound if not exists
    if (!sound) {
      sound = new Howl({
        src: [notificationSoundFile],
        volume: 0.7,
        preload: true,
        html5: true, // Add this for better compatibility
        onload: () => {
          console.log("🔊 Sound file loaded successfully");
          initialized = true;
          
          // Try to unlock audio context
          if (Howler.ctx && Howler.ctx.state !== "running") {
            Howler.ctx.resume().then(() => {
              unlocked = true;
              console.log("🔊 Audio context resumed");
              if (pendingPlay) {
                pendingPlay();
                pendingPlay = null;
              }
            }).catch(err => {
              console.error("Failed to resume audio context:", err);
            });
          } else {
            unlocked = true;
          }
        },
        onloaderror: (id, error) => {
          console.error("Failed to load sound file:", error);
          // Try with a different approach - use Audio element as fallback
          useFallbackAudio();
        }
      });
    }

    // Resume browser audio context
    if (Howler.ctx && Howler.ctx.state !== "running") {
      await Howler.ctx.resume();
      unlocked = true;
      console.log("🔊 Audio context resumed on init");
    }

    initialized = true;
    console.log("🔊 Notification sound initialized");
  } catch (err) {
    console.error("Audio unlock failed:", err);
    useFallbackAudio();
  }
};

// Fallback using native Audio element
let fallbackAudio: HTMLAudioElement | null = null;

const useFallbackAudio = () => {
  try {
    fallbackAudio = new Audio(notificationSoundFile);
    fallbackAudio.preload = 'auto';
    fallbackAudio.volume = 0.7;
    console.log("🔊 Using fallback audio element");
    initialized = true;
    unlocked = true;
  } catch (err) {
    console.error("Fallback audio failed:", err);
  }
};

export const playNotificationSound = async () => {
  console.log("🔔 Attempting to play sound...");
  
  // Try Howl first
  if (sound && initialized) {
    try {
      // Ensure audio context is running
      if (Howler.ctx && Howler.ctx.state !== "running") {
        await Howler.ctx.resume();
        unlocked = true;
      }
      
      if (!unlocked) {
        console.log("🔇 Audio not unlocked yet, queueing...");
        pendingPlay = () => playNotificationSound();
        return;
      }
      
      // Restart sound cleanly
      sound.stop();
      sound.seek(0);
      sound.play();
      console.log("🔔 Playing notification sound via Howl");
      return;
    } catch (err) {
      console.error("Howl play error:", err);
    }
  }
  
  // Fallback to native audio
  if (fallbackAudio) {
    try {
      fallbackAudio.currentTime = 0;
      const playPromise = fallbackAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Fallback audio play error:", error);
          // Create a beep using Web Audio as last resort
          playBeep();
        });
      }
      console.log("🔔 Playing notification sound via fallback");
    } catch (err) {
      console.error("Fallback audio error:", err);
      playBeep();
    }
  } else {
    playBeep();
  }
};

// Last resort: Web Audio beep
let audioContext: AudioContext | null = null;

const playBeep = () => {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (audioContext.state === "suspended") {
      audioContext.resume().then(() => {
        playBeep();
      });
      return;
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.3);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    console.log("🔔 Playing beep sound");
  } catch (err) {
    console.error("Beep failed:", err);
  }
};

export const preloadNotificationSound = () => {
  if (!sound && !fallbackAudio) {
    // Preload without playing
    sound = new Howl({
      src: [notificationSoundFile],
      volume: 0.7,
      preload: true,
    });
    console.log("🔊 Preloading notification sound");
  }
};

export const setNotificationVolume = (volume: number) => {
  if (sound) {
    sound.volume(Math.max(0, Math.min(1, volume)));
  }
  if (fallbackAudio) {
    fallbackAudio.volume = Math.max(0, Math.min(1, volume));
  }
};

// Force unlock audio on user interaction
export const forceUnlockAudio = async () => {
  if (Howler.ctx && Howler.ctx.state !== "running") {
    await Howler.ctx.resume();
    unlocked = true;
    console.log("🔊 Audio forcefully unlocked");
  }
};