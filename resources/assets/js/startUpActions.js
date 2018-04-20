/**
 * startUpActions is called from (imported into) the main.js module, and used in the Vue launch block.
 *
 * (C) 2018 Matthias Kuhs
 *
 * @param {*} store   The Vuex store object as defined in main.js
 * @param {*} router  The Vue router object
 */
export default function startUpActions(store) {
  // get the user object from the global namespace (set in layouts\app.blade.php)
  let user = JSON.parse(window.chatter_server_data.user)
  store.commit('setUser', user)

  // get all rooms from the backend, but only when user was logged in
  if (user.name && user.name !== 'guest') {
    // load the rooms for this user
    store.dispatch('loadRooms')

    // load simple list of all users
    store.dispatch('loadUsers')

    // start listening to our backend broadcast channel
    window.Echo.join('chatroom')

      // getting list of all users logged into this room
      .here(users => store.commit('setUsersInRoom', users))

      // adding new present user to the list
      .joining(user => store.commit('addToUsersInRoom', user))

      // a user left the list of present users
      .leaving(user => store.commit('removeFromUsersInRoom', user))

      // a room was added
      .listen('RoomCreated', e => {
        if (e.room) {
          store.commit('addRoom', e.room)
        } else {
          window.console.warn(e)
        }
      })
  }
}