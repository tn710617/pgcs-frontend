// public/service-worker.js
// self.addEventListener('push', function(event) {
//     console.log('Push event received:', event);
//     const data = event.data.json();
//     console.log('Push event data:', data);
//     const title = data.title || 'Notification';
//     const options = {
//         body: data.body || 'You have a new notification.',
//         // icon: data.icon || '/logo192.png',
//     };
//
//     event.waitUntil(
//         self.registration.showNotification(title, options)
//     );
// });

// Listen for messages from the main thread
self.addEventListener('message', function(event) {
    // const notification = event.data;
    const notification = 'You have a new notification.'
    const title = 'You have a new notification.'
    // const title = notification.title || 'Notification';
    const options = {
        body: notification
        // icon: notification.icon || '/logo192.png',
    };

    self.registration.showNotification(title, options);
});