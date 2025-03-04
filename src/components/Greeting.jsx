import { useState } from 'preact/hooks';
import '@fontsource-variable/merriweather-sans';

export default function Greeting({messages}) {

  const randomMessage = () => messages[(Math.floor(Math.random() * messages.length))];

  const [greeting, setGreeting] = useState(randomMessage());

  return (
    <div>
      <h3 style={{fontFamily:"'Merriweather Sans Variable', sans-serif"}}>¡{greeting}! ¡Gracias por tu visita!</h3>
    </div>
  );
}
