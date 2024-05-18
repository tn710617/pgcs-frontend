self.addEventListener('message', function (event) {
    const title = '收到新座標'
    const notification = event.data
    const options = {
        body: notification,
        icon: './logo.png',
    };

    // self.registration.showNotification(title, options);

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    const notification = event.notification;
    console.log(event)
    const body = notification.body;
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            if (clientList.length > 0) {
                const client = clientList[0];
                client.focus().then(() => {
                    client.postMessage({
                        action: 'copyToClipboard',
                        text: body
                    });
                });
            } else {
                clients.openWindow('/').then(windowClient => {
                    windowClient.postMessage({
                        action: 'copyToClipboard',
                        text: body
                    });
                });
            }
        })

        // clients.matchAll({type: 'window', includeUncontrolled: true}).then(clientList => {
        //     if (clientList.length > 0) {
        //         clientList[0].postMessage({
        //             action: 'copyToClipboard',
        //             text: body
        //         });
        //     }
        // })

        // (async () => {
        //     try {
        //         await navigator.clipboard.writeText(body);
        //         console.log('Notification body copied to clipboard:', body);
        //     } catch (err) {
        //         console.error('Failed to copy text to clipboard:', err);
        //     }
        // })()
    );
});