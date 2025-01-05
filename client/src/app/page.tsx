"use client"
import React from 'react'
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import calendar styles
import { format } from 'date-fns';
import { useRouter } from "next/router";
import "./globals.css";


const page:React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [guests, setGuests] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [message, setMessage] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]); // Store booked slots for the selected date
  const [isBookingSuccessful, setIsBookingSuccessful] = useState(false); // Booking status
  const [reservationDetails, setReservationDetails] = useState<any>(null); // Store booking details
  const [backendMessage, setBackendMessage] = useState('');
  const [validationMessage, setValidationMessage] = useState(''); 
  const [bookingMessage, setBookingMessage] = useState(''); 
const [dates , setDates] = useState("")
  // const router = useRouter();



  const availableTimeSlots: string[]= [
    '10:00 AM', '11:00  AM',  '12:00 PM',
    '1:00 PM',
    '1:30 PM',
    '2:00 PM',
    '3:00 PM',
    '4:30 PM',
    '5:00 PM',
    '7:00 PM',
   
    '11:30 PM', 
    '9:30 PM', 


  ];
  useEffect(() => { setIsClient(true); }, []);

  const fetchBookings = async () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    try {
      const response = await fetch("https://table-isyu.vercel.app/api/bookings"  );
      const data = await response.json();
      const bookedSlotsForDay = data
        .filter((booking: any) => booking.date === dateStr)
        .map((booking: any) => booking.time);
      setBookedSlots(bookedSlotsForDay);
    } catch (error) {
      console.error('Error fetching bookings:', error);
  // Show error message if fetching fails
    }
  };

  useEffect(() => {
    fetchBookings(); // Fetch bookings every time the selected date changes
  }, [selectedDate]);

  // if (isClient) 
  //   {
  //      return <div></div>
  //     }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !contact || !guests) {
      setValidationMessage('All fields are required. Please fill out all the details.');
      return;
    } else {
      setValidationMessage(''); // Clear validation message if all fields are filled
    }
    
    if (!selectedDate) {
      setMessage('Please select a date.');
      return;
    }

    if (!selectedTime) {
      setMessage('Please select a time slot.');
      return;
    }

    try {
      const response = await fetch('https://table-isyu.vercel.app/api/book', {
        method: 'POST',
         mode: 'cors', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          contact,
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedTime,
          guests,
        }),
      });
       if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`HTTP error! status: ${response.status}`);
  }
      const data = await response.json();
      console.log(data);
      if (data.success === false) {
        setBackendMessage(data.message); // Show error message from backend
        setBookingMessage('');
      } else {
        setReservationDetails({
          id: Date.now(),
          name,
          contact,
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedTime,
          guests,
        });
        setIsBookingSuccessful(true);
        setBookingMessage('Booking Successful!'); 
      }
     
    }catch (error) {
      setBackendMessage('SomeThing went wrong check the details again!'); // Show error if there is a problem with the API
    }
  };

  const handleDateChangeInline = (date: Date) => {
  
   
    const today = new Date();
    
    // Reset the time portion of both dates to compare only the date (without time)
    today.setHours(0, 0, 0, 0); // Set today's date to midnight
    date.setHours(0, 0, 0, 0); // Set selected date to midnight

    const maxAllowedDate = new Date('2025-12-31'); // Limit the selection to December 31, 2025

  if (date < today) { // Check if the selected date is in the past
    setDates('Please select a valid date. Past dates are not allowed.');
    setSelectedDate(today); // Optionally reset the date to today
    return;
  }

  if (date > maxAllowedDate) { // Check if the selected date is beyond 2025
    setDates('Please select a valid date. Dates beyond 2025 are not allowed.');
    setSelectedDate(today); // Optionally reset the date to today
    return;
  }
    setSelectedDate(date);
    setSelectedTime(''); // Reset selected time when the date changes
    setValidationMessage(''); // Reset validation message when the date changes
    setBackendMessage(''); // Reset backend message when the date changes
    setBookingMessage(''); 
    setDates("")
  };

  const handleTimeSlotSelect = (time: string) => {
    if (bookedSlots.includes(time)) {
      setBackendMessage('This time slot is already booked. Please choose another.'); // Show message if the slot is already booked
      setSelectedTime('');
      return;
    }
    setSelectedTime(time); // Set the selected time if available
    setBackendMessage(''); // Clear backend message
  };


  // Booking Summary Page
  if (isBookingSuccessful && reservationDetails) {
    
    return (
      
      <div className="container">
        <div className="card">
          <h1 className="">{bookingMessage && <p className="heading">{bookingMessage}</p>}</h1>

          <div className="cont">
          <p className="message">Thank you for your reservation!</p>
            <p className="details">Here are your booking details:</p>
            <div className="contain">
              <p className="detail"><strong>Name:</strong> {reservationDetails.name}</p>
              <p className="detail"><strong>Contact:</strong> {reservationDetails.contact}</p>
              <p className="detail"><strong>Date:</strong> {reservationDetails.date}</p>
              <p className="detail"><strong>Time:</strong> {reservationDetails.time}</p>
              <p className="detail"><strong>Guests:</strong> {reservationDetails.guests}</p>
            </div>
          </div>


          <button
            onClick={() => {
              setIsBookingSuccessful(false);
              setReservationDetails(null);
              setSelectedTime("");
              setName("");
              setContact("");
              setGuests("");
              setBookingMessage('');
              setMessage("")
            }}
            className="custom-button"
          >
            Make Another Booking
          </button>

        </div>

      </div>
    );
  }






  return (
    <div className="">
    <h1 className="head ">Restaurant Table Booking</h1>
    <div className="containe">
      
    <div className="cons">
      
      
      {/* Calendar View */}
      <div className="cc">
      <h2 className="hh">Select a Date</h2>
        <Calendar
         onChange={(date) => handleDateChangeInline(date as Date)}
          value={selectedDate}
          className="react-calendar"
          tileClassName={({ date, view }) =>
            view === 'month' && date.getTime() === selectedDate.getTime()
              ? 'selecte-tile'
              : 'hover-tile'
          }
        
        />
        {dates && (
            <p className="paragraph">{dates}</p>
          )}
      </div>

      {/* Time Slot Selection */}
      <div className="time">
        <h2 className="time-head">Available Time Slots</h2>
        <div className="grid-con"> 
          {availableTimeSlots.map((time) => (
            <button
            key={time}
            onClick={() => handleTimeSlotSelect(time)}
            className={` butt ${selectedTime === time ? "selected-time" : "default-time"} trans`} 
            style={{ backgroundColor: bookedSlots.includes(time) ? '#6b7280' : '', 
            cursor: bookedSlots.includes(time) ? 'not-allowed' : '' 
          }}
              disabled={bookedSlots.includes(time)}
            >
              {time}
            </button>
          ))}

          
       </div>
       {backendMessage && <p className="error-message">{backendMessage}</p>}
       {message && <p className="error-message">{message}</p>}

      </div>

      {/* Booking Form */}
      <form 
      onSubmit={handleSubmit} 
      className="ff">
        <div>
          <label className="labe">Name</label>
          <input
            type="text"
            className="inpuu"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="labe">Contact</label>
          <input
            type="text"
            className="inpuu"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
      
          />
        </div>
        <div>
          <label className="labe">Guests</label>
          <input
            type="number"
            className="inpuu"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
 
          />
        </div>
        {validationMessage && <p className="error-message">{validationMessage}</p>}
        <button
          type="submit"
          className="book"
        >
          Book Now
        </button>
      </form>
     
    </div>
  </div>
  </div>
  )
}

export default page;
