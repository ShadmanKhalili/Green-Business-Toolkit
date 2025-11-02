
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-s-teal-dark text-s-teal-light p-4 text-center mt-auto border-t border-s-teal">
      <p className="text-sm">&copy; {new Date().getFullYear()} সবুজ ব্যবসা টুলকিট। সর্বস্বত্ব সংরক্ষিত।</p>
      <p className="text-xs mt-1 opacity-80">বাংলাদেশের উপকূলে টেকসই ভবিষ্যৎ ক্ষমতায়ন।</p>
      <p className="text-xs mt-2 opacity-70">Created by Shadman Khalili with Oxfam.</p>
    </footer>
  );
};