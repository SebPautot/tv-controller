# tv-controller

This is a Node.js server that acts as a middleman for communications between a client and one or multiple Orange Liveboxes.

It has an API meaning you can use it programmatically across a network. It has multiple endpoints that can be used to get and set a Livebox's data.

# Endpoints

# /api/getChannelByEpg?epg={epg}

Replace {epg} with an EPG, which is what the Livebox uses to get and set channel data. You can convert EPG to channel data using this endpoint.

Optionnal query parameter :

program : if set to true, it'll also query the channel's program, the device needs to be connected to the internet.

# /api/getDeviceList

Returns the currently detected device list. The server checks for new devices and adds them to the list. You'll need to check client-side if the device you've chosen is removed or not, if device #2 is removed but an other takes its place it might create issues when communicating.

# /api/getDeviceStatus?device={device_integer}

Returns the device's status based on its index in the device list.

# /api/pushButton?key={key_integer}&mode={ode_integer}&device={device_integer}

It'll send a button press to the Livebox as if it were a remote controller, mode defaults to 0 if omitted, mode 0 is just a button press, mode 1 is when you start holding the button, mode 2 is when you end holding the button.

A key code list is included in the source code.

# /api/setChannelByEPG?device={device_integer}&epg={epg}

Sets the channel of the device by sending it an EPG.


# Included data :

In the data folder there are data files you can use such as the key list, and a channel list.
