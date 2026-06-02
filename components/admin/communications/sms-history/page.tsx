import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function SMSComingSoon() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <MessageSquare className="w-10 h-10 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">SMS History</h1>
                <p className="text-gray-500 mb-4">Coming Soon!</p>
                <p className="text-sm text-gray-400">
                    We're working on  SMS History for instant notifications.
                    <br />
                    Stay tuned for updates!
                </p>
            </div>
        </div>
    );
}