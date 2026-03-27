const getPublicKey = () =>
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

export const isPushSupported = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window;

export const getPushSubscription = async () => {
  if (!isPushSupported()) return null;

  const registration = await navigator.serviceWorker.getRegistration(
    '/notification-sw.js'
  );

  if (!registration) return null;

  return registration.pushManager.getSubscription();
};

export const subscribeToPush = async () => {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported');
  }

  const publicKey = getPublicKey();
  if (!publicKey) {
    throw new Error('Missing VAPID public key');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Permission not granted');
  }

  const registration = await navigator.serviceWorker.register(
    '/notification-sw.js'
  );

  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }));

  await fetch('/api/notifications/push-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  });

  return subscription;
};

export const unsubscribeFromPush = async () => {
  const subscription = await getPushSubscription();
  if (!subscription) return false;

  await fetch('/api/notifications/push-subscription', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  });

  return subscription.unsubscribe();
};
