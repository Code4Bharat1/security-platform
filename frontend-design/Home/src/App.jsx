import Navbar from './Navbar'
import Hero from './Hero'
import Certificates from './Certifications'
import WhyUs from './WhyUs'
function App() {
  return (
    <div className='bg-black h-full'>
      <Navbar></Navbar>
      <Hero></Hero>
      <Certificates></Certificates>
      <WhyUs></WhyUs>
    </div>
  )
}

export default App
