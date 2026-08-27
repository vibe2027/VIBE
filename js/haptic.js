/**
 * VIBE Haptic v1 — Vibrations haptiques et détection de proximité
 */
(function () {
  'use strict';

  const PATTERNS = {
    message: [20, 30, 20],
    proximite: [50, 100, 50, 100],
    connected: [100, 50, 100],
    sos_alert: [200, 100, 200, 100, 200],
    heartbeat: [30, 50, 30]
  };

  function vibrate(pattern) {
    if (!navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn('Vibration non supportée:', e.message);
    }
  }

  function onMessageReceived() {
    vibrate(PATTERNS.message);
  }

  function onProximityAlert() {
    vibrate(PATTERNS.proximite);
  }

  function onConnected() {
    vibrate(PATTERNS.connected);
  }

  function sosAlert() {
    vibrate(PATTERNS.sos_alert);
  }

  async function detectProximity(targetLat, targetLng, radiusMeters = 500) {
    if (!navigator.geolocation) return false;

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const distance = haversine(pos.coords.latitude, pos.coords.longitude, targetLat, targetLng);
          resolve(distance <= radiusMeters);
        },
        () => resolve(false),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  }

  function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  window.vibeHaptic = {
    vibrate,
    onMessageReceived,
    onProximityAlert,
    onConnected,
    sosAlert,
    detectProximity
  };
})();
