"use client"

import { useSearchParams } from "next/navigation"

export default function ConfirmationPage() {

  const params = useSearchParams()

  const train = params.get("name")
  const price = params.get("price")

  return (

    <div style={{textAlign:"center",marginTop:"100px"}}>

      <h1>Booking Confirmed 🎉</h1>

      <p>Train : {train}</p>

      <p>Amount Paid : ₹{price}</p>

      <button onClick={()=>window.print()}>
        Download Ticket
      </button>

    </div>
  )
}