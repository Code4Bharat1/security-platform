const ContactForm = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* Form Section */}
      <form className="rounded-xl shadow-lg p-8 text-white flex-1 justify-center items-center">
        <div className="flex">
          <div className="text-white rounded-xl shadow-lg p-15 bg-blue-100 flex flex-col justify-start">
            <h2 className="text-4xl font-bold mb-6 border-b border-gray-600 pb-2">Contact Details</h2>
            <ul className="space-y-4 text-xl">
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M21 8V7l-3 2-2-2-2 2-2-2-2 2-2-2-2 2-2-2-3 2v1l3 2v6l-3 2v1l3-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2 3-2v-1l-3-2v-6l3-2z" /></svg>
                director@nexcorealliance.com
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M3 5.5a1 1 0 0 1 1-1h1.586a1 1 0 0 1 .707.293l2.414 2.414a1 1 0 0 1 0 1.414l-1.586 1.586a15.928 15.928 0 0 0 6.586 6.586l1.586-1.586a1 1 0 0 1 1.414 0l2.414 2.414a1 1 0 0 1 .293.707V20a1 1 0 0 1-1 1A16 16 0 0 1 3 5.5z" /></svg>
                +91 95944 30295
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5S13.4 11.5 12 11.5z" /></svg>
                Off BKC, Mumbai, India 400070
              </li>
            </ul>
          </div>
          <div className="flex-1 relative px-30">
            {/* Input Fields - Wrapped in a relative container */}
            <div className="relative z-20">
              <div className="mb-4">
                <label className="block mb-1 text-xl">Name</label>
                <input type="text" placeholder="Enter Your Name" className="w-full px-4 py-2 rounded-xl bg-white border border-gray-600 text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-500" />
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-xl">Phone Number</label>
                <input type="text" placeholder="Enter Your Phone Number" className="w-full px-4 py-2 rounded-xl bg-white border border-gray-600 text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-500" />
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-xl">E-Mail Id</label>
                <input type="email" placeholder="Enter Your E-Mail Id" className="w-full px-4 py-2 rounded-xl bg-white border border-gray-600 text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-500" />
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-xl">Message</label>
                <textarea placeholder="Enter your message" rows="5" className="w-full px-4 py-2 rounded-xl bg-white border border-gray-600 text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-500"></textarea>
              </div>
            </div>

            
          </div>

        </div>

      </form>
    </div>
  );
};

export default ContactForm;
