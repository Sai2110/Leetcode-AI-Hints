// // popup.js
// document.addEventListener('DOMContentLoaded', function () {
//     const hintButton = document.getElementById('get-hint-button');
//     const hintDisplay = document.getElementById('hint');
//     const loadingDisplay = document.getElementById('loading');
  
//     function showLoading() {
//       if (loadingDisplay) loadingDisplay.style.display = 'block';
//       if (hintDisplay) hintDisplay.style.display = 'none';
//     }
  
//     function hideLoading() {
//       if (loadingDisplay) loadingDisplay.style.display = 'none';
//       if (hintDisplay) hintDisplay.style.display = 'block';
//     }
  
//     function showError(message) {
//       if (hintDisplay) {
//         hintDisplay.textContent = `Error: ${message}`;
//         hintDisplay.style.display = 'block';
//       }
//     }
  
//     if (hintButton) {
//       hintButton.addEventListener('click', async function () {
//         try {
//           showLoading();
  
//           // Get current tab URL
//           const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
//           const tabUrl = tabs[0].url;
  
//           // Check if we're on a LeetCode problem page
//           if (!tabUrl.includes('leetcode.com/problems/')) {
//             throw new Error('Please navigate to a LeetCode problem page');
//           }
  
//           // Extract question name
//           const questionName = extractQuestionNameFromUrl(tabUrl);
//           if (!questionName) {
//             throw new Error('Could not find question name in URL');
//           }
  
//           console.log('Sending request for question:', questionName);
  
//           const response = await fetch('http://localhost:3000/get-hint', {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ questionName }),
//           });
  
//           if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.error || 'Failed to get hint');
//           }
  
//           const data = await response.json();
//           if (hintDisplay) {
//             hintDisplay.textContent = data.hint;
//           }
  
//         } catch (error) {
//           console.error('Error:', error);
//           showError(error.message);
//         } finally {
//           hideLoading();
//         }
//       });
//     }
//   });
  
//   function extractQuestionNameFromUrl(url) {
//     const match = url.match(/problems\/([^/]+)/);
//     return match ? match[1] : null;
//   }

//----------------------------------------------------------------

// popup.js
// popup.js
let currentHintStep = 1;
let lastQuestionName = '';

document.addEventListener('DOMContentLoaded', function () {
  const firstHintButton = document.getElementById('get-first-hint-button');
  const nextHintButton = document.getElementById('get-next-hint-button');
  const hintDisplay = document.getElementById('hint');
  const loadingDisplay = document.getElementById('loading');
  const stepCounter = document.getElementById('step-counter');

  function showLoading() {
    loadingDisplay.style.display = 'block';
    hintDisplay.style.display = 'none';
  }

  function hideLoading() {
    loadingDisplay.style.display = 'none';
    hintDisplay.style.display = 'block';
  }

  function showError(message) {
    hintDisplay.textContent = `Error: ${message}`;
    hintDisplay.style.display = 'block';
    stepCounter.textContent = '';
  }

  function updateStepCounter(step) {
    const maxSteps = 5;
    if (step <= maxSteps) {
      stepCounter.textContent = `Hint ${step} of ${maxSteps}`;
    } else {
      stepCounter.textContent = `Final Explanation`;
    }
  }

  firstHintButton.addEventListener('click', async function () {
    try {
      showLoading();
      currentHintStep = 1;

      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tabUrl = tabs[0].url;

      if (!tabUrl.includes('leetcode.com/problems/')) {
        throw new Error('Please navigate to a LeetCode problem page');
      }

      const questionName = extractQuestionNameFromUrl(tabUrl);
      if (!questionName) throw new Error('Could not extract question name from URL');

      lastQuestionName = questionName;
      await fetchAndDisplayHint(questionName, currentHintStep, hintDisplay);
      updateStepCounter(currentHintStep);

    } catch (error) {
      console.error(error);
      showError(error.message);
    } finally {
      hideLoading();
    }
  });

  nextHintButton.addEventListener('click', async function () {
    try {
      showLoading();
      if (!lastQuestionName) throw new Error("Please click 'Get Hint' first");

      currentHintStep++;
      await fetchAndDisplayHint(lastQuestionName, currentHintStep, hintDisplay);
      updateStepCounter(currentHintStep);
    } catch (error) {
      console.error(error);
      showError(error.message);
    } finally {
      hideLoading();
    }
  });
});

function extractQuestionNameFromUrl(url) {
  const match = url.match(/problems\/([^/]+)/);
  return match ? match[1] : null;
}

async function fetchAndDisplayHint(questionName, step, hintDisplay) {
  const response = await fetch('http://localhost:3000/get-hint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionName, step }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get hint');
  }

  const data = await response.json();
  hintDisplay.textContent = data.hint;
}
