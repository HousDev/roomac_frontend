import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppComingSoon() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                    <MessageCircle className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">WhatsApp History</h1>
                <p className="text-gray-500 mb-4">Coming Soon!</p>
                <p className="text-sm text-gray-400">
                    We're working on  WhatsApp History for seamless communication.
                    <br />
                    Stay tuned for updates!
                </p>
            </div>
        </div>
    );
}