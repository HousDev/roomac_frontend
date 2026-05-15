// src/utils/notificationSound.ts

import notificationSoundFile from "@/app/src/assets/sounds/notification.mp3";

let audioElement: HTMLAudioElement | null = null;
let initialized = false;
let unlocked = false;
let pendingQueue: (() => void)[] = [];

// Use a simple Audio element instead of Howler for better compatibility
export const initNotificationSound = () => {
  if (initialized || typeof window === 'undefined') return;
  
  try {
    audioElement = new Audio(notificationSoundFile);
    audioElement.preload = 'auto';
    audioElement.volume = 0.7;
    
    audioElement.addEventListener('canplaythrough', () => {
      console.log('🔊 Notification sound loaded');
    });
    
    audioElement.addEventListener('error', (e) => {
      console.error('Failed to load notification sound:', e);
    });
    
    initialized = true;
    console.log('🔊 Notification sound initialized');
    
    // Auto-unlock on ANY user interaction
    const unlock = () => {
      if (!unlocked && audioElement) {
        // Try to play and immediately pause to unlock
        audioElement.play()
          .then(() => {
            audioElement.pause();
            audioElement.currentTime = 0;
            unlocked = true;
            console.log('🔊 Audio unlocked successfully');
            
            // Play any pending sounds
            while (pendingQueue.length > 0) {
              const pending = pendingQueue.shift();
              pending?.();
            }
          })
          .catch((err) => {
            console.log('Audio unlock attempt failed:', err.name);
          });
      }
    };
    
    // Listen to multiple events to ensure unlock
    window.addEventListener('click', unlock);
    window.addEventListener('touchstart', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('mousedown', unlock);
    
  } catch (error) {
    console.error('Failed to init sound:', error);
  }
};

export const playNotificationSound = () => {
  if (!initialized) {
    console.log('Sound not initialized, init now');
    initNotificationSound();
    pendingQueue.push(() => playNotificationSound());
    return;
  }
  
  if (!unlocked) {
    console.log('Audio not unlocked yet, queueing...');
    pendingQueue.push(() => playNotificationSound());
    // Try to unlock again
    if (audioElement) {
      audioElement.play()
        .then(() => {
          audioElement.pause();
          audioElement.currentTime = 0;
          unlocked = true;
          console.log('🔊 Audio unlocked during play attempt');
          // Play the queued sound
          const pending = pendingQueue.shift();
          pending?.();
        })
        .catch(() => {});
    }
    return;
  }
  
  if (audioElement) {
    try {
      audioElement.currentTime = 0;
      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Play failed:', error);
          // If play fails, try to unlock again
          if (error.name === 'NotAllowedError') {
            unlocked = false;
            pendingQueue.push(() => playNotificationSound());
          }
        });
      }
      console.log('🔔 Playing notification sound');
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }
};

export const preloadNotificationSound = () => {
  if (!initialized) {
    initNotificationSound();
  }
};

export const setNotificationVolume = (volume: number) => {
  if (audioElement) {
    audioElement.volume = Math.max(0, Math.min(1, volume));
  }
};

// Force unlock - call this when you receive a notification
export const forceUnlockAudio = () => {
  if (audioElement && !unlocked) {
    audioElement.play()
      .then(() => {
        audioElement.pause();
        audioElement.currentTime = 0;
        unlocked = true;
        console.log('🔊 Audio force unlocked');
        // Play pending sounds
        while (pendingQueue.length > 0) {
          const pending = pendingQueue.shift();
          pending?.();
        }
      })
      .catch(() => {});
  }
};