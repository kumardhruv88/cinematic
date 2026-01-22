import React from 'react';
import Container from './Container';
import { Github, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[#050816] mt-auto py-12 border-t border-white/5">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div>
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-purple to-accent-cyan mb-4">
                            CINEMATIQ
                        </h3>
                        <p className="text-gray-400 max-w-xs">
                            Your personal cinema universe. AI-powered recommendations tailored just for you.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-accent-cyan transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-accent-cyan transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-accent-cyan transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Connect</h4>
                        <div className="flex gap-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-accent-purple/20">
                                <Github size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-accent-cyan/20">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-accent-orange/20">
                                <Instagram size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} CINEMATIQ. All rights reserved.
                </div>
            </Container>
        </footer>
    );
};

export default Footer;
