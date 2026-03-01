import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const useGuide = () => {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    popoverClass: 'custom-driver-popover',
    nextBtnText: 'Next',
    prevBtnText: 'Previous',
    doneBtnText: 'Done',
    allowClose: true,
    steps: [
      {
        element: '.sidebar-logo',
        popover: {
          title: 'Welcome to AI Assistant',
          description: 'Your intelligent companion for academic paper analysis and management.',
          position: 'right'
        }
      },
      {
        element: '.nav-paper-summary',
        popover: {
          title: 'Paper Summary',
          description: 'Upload your PDF papers here. Our AI will automatically generate summaries, key insights, and conclusions for you.',
          position: 'right'
        }
      },
      {
        element: '.nav-new-chat',
        popover: {
          title: 'New Chat',
          description: 'Start a new conversation with the AI assistant. Whether you need help with a paper, a question, or just want to chat, we\'re here to help.',
          position: 'right'
        }
      },
      {
        element: '.nav-bibliography',
        popover: {
          title: 'Bibliography Reference',
          description: 'Access all extracted references, manage citations, and export them in various academic formats.',
          position: 'right'
        }
      },
      {
        element: '.multi-select-mode-1',
        popover: {
          title: 'Multi-select Mode',
          description: 'Click to enable multi-select mode. You can select multiple papers at once to perform batch operations, such as add them to a folder or delete them.',
          position: 'right'
        }
      },
      {
        element: '.nav-folder',
        popover: {
          title: 'Library Management',
          description: 'Organize your research by creating custom folders and categorizing your documents.',
          position: 'right'
        }
      },
      {
        element: '.multi-select-mode-2',
        popover: {
          title: 'Multi-select Mode',
          description: 'Click to enable multi-select mode. You can select multiple papers at once to perform batch operations, such as export them with specific format or delete them.',
          position: 'right'
        }
      }
    ]
  });

  const startGuide = () => {
    driverObj.drive();
  };

  const driveToStep = (index) => driverObj.drive(index);

  return { startGuide, driveToStep };
};