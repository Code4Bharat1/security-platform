import Navbar from './Navbar'
import Hero from './Hero'
import Certificates from './Certifications'
import WhyUs from './WhyUs'
import ToolsCard from './ToolsCard'
import Blogs from './Blogs'
import Footer from './Footer'
function App() {
  return (
    <div className='bg-black'>
      <Navbar></Navbar>
      <Hero></Hero>
      <Certificates></Certificates>
      <WhyUs></WhyUs>
      <ToolsCard></ToolsCard>
      <Blogs></Blogs>
      <Footer></Footer>
    </div>
  )
}

export default App
