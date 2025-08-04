import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full text-center py-4 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-t dark:border-gray-700">
      <p className="text-sm">Developed by Krushna</p>
      <a
        href="https://github.com/krushna-chandra"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-2"
      >
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
          alt="GitHub"
          className="w-6 h-6 mx-auto hover:opacity-80 transition-opacity"
        />
      </a>
    </footer>
  );
}
// This Footer component provides a simple footer with a link to the developer's GitHub profile.
// It includes a GitHub icon that links to the specified profile, styled for both light and