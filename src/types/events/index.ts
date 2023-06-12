enum userEvents {
  USER_REGISTERED = 'user.registered',
  EMAIL_VERIFICATION = 'email.verification',
  PASSWORD_REQUEST = 'password.request',
  PASSWORD_CHANGE = 'password.change',
  USER_ONLINE = 'user.online',
}

export const events = {
  ...userEvents,
};
