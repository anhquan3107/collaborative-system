// frontend/js/utils/notify.js
export const notyf = new Notyf({
  duration: 3000,
  position: { 
    x: 'center', 
    y: 'top' 
  },
  ripple: true,
  dismissible: true,
});
export const messageNotyf = new Notyf({
  duration: 4000,
  position: { x: "center", y: "top" },
  ripple: true,
  dismissible: true,
  types: [
    {
      type: "message",
      background: "#4a6cf7",  // nice messenger-like color
      icon: {
        className: "fas fa-comment",
        tagName: "i",
      },
    },
  ],
});

