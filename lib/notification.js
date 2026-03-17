export async function requestNotificationPermission(){

  if(!("Notification" in window)) return false

  const permission = await Notification.requestPermission()

  return permission === "granted"
}

export function sendReminderNotification(){

  if(Notification.permission !== "granted") return

  new Notification("Fintia",{
    body:"No has registrado gastos hoy. Recuerda añadir tus movimientos.",
    icon:"/icon.png"
  })

}