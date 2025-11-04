import React from 'react';

const defaultIconClass = "w-6 h-6 mr-3 text-s-teal-dark flex-shrink-0";

export const GoalIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || defaultIconClass}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125H8.625c-.621 0-1.125.504-1.125 1.125v3.375m0 0a3 3 0 003 3h3a3 3 0 003-3m-9 3c0 .621.504 1.125 1.125 1.125h5.75c.621 0 1.125-.504 1.125-1.125m-7.5 0V12A2.25 2.25 0 019.75 9.75h4.5A2.25 2.25 0 0116.5 12v6.75" />
    </svg>
);

export const ActionIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || defaultIconClass}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const PartnerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || defaultIconClass}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-3.741-5.582M12 15.75a3 3 0 01-3-3m3 3a3 3 0 00-3-3m3 3V18m-3-4.5H6.75m0 0A3.75 3.75 0 013 15V9c0-1.09.268-2.094.741-2.992M6.75 11.25A3.75 3.75 0 003 7.5V3c0 1.09.268 2.094.741 2.992" />
    </svg>
);

export const ImpactIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || defaultIconClass}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.976 5.197M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
);

export const AiIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5M15.75 3v1.5M12 4.5v-1.5m0 18v-1.5M15.75 21v-1.5m-6-15H8.25m7.5 0h-1.5M12 21V3m0 0c-2.485 0-4.5 2.015-4.5 4.5 0 .891.258 1.71.707 2.427M12 3c2.485 0 4.5 2.015 4.5 4.5 0 .891-.258 1.71-.707 2.427m0 0c-1.583.96-3.417.96-5 0A4.502 4.502 0 0112 4.5v0z" />
  </svg>
);

export const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
