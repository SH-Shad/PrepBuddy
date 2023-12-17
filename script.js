let totalDuration, questionCount, avgTime;
let currentQuestion = 0;
let interval, extraTimeStarted = false, isPaused = false, isTimerActive = false;
let secondsElapsed = 0, questionStartTime;
let questionTimes = []; // Array to store the time taken for each question
let isMuted = false; // For mute functionality

document.getElementById('calculate-btn').addEventListener('click', function() {
    totalDuration = parseInt(document.getElementById('total-duration').value);
    questionCount = parseInt(document.getElementById('question-count').value);
    
    if (isNaN(totalDuration) || isNaN(questionCount) || totalDuration <= 0 || questionCount <= 0) {
        alert('Please enter valid, positive numbers for duration and question count.');
        return;
    }

    avgTime = (totalDuration * 60 / questionCount).toFixed(0);
    document.getElementById('avg-time-display').textContent = `${avgTime}`;
    document.getElementById('total-questions').textContent = questionCount;
    document.getElementById('current-question').textContent = '0';
    resetTimer();
});

document.getElementById('start-timer').addEventListener('click', function() {
    if (!avgTime) {
        alert('Please calculate the average time first.');
        return;
    }

    if (!isTimerActive || currentQuestion === 0) {
        currentQuestion = 1;
        isTimerActive = true;
        questionTimes = [];
        document.getElementById('current-question').textContent = currentQuestion;
        document.getElementById('summary').hidden = true;
        startTimer(avgTime);
    }
});

document.getElementById('pause-timer').addEventListener('click', function() {
    if (!isPaused) {
        clearInterval(interval);
        this.textContent = 'Resume';
    } else {
        startTimer(avgTime - secondsElapsed);
        this.textContent = 'Pause';
    }
    isPaused = !isPaused;
});

document.getElementById('reset-timer').addEventListener('click', function() {
    resetTimer();
});

document.getElementById('next-question').addEventListener('click', function() {
    if (currentQuestion === 0 || !isTimerActive) {
        alert('Please start the timer first.');
        return;
    }

    let timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
    questionTimes[currentQuestion - 1] = timeTaken;

    if (currentQuestion < questionCount) {
        currentQuestion++;
        document.getElementById('current-question').textContent = currentQuestion;
        startTimer(avgTime);
        if (currentQuestion === questionCount) {
            this.textContent = 'Finish Exam';
        }
    } else {
        clearInterval(interval);
        isTimerActive = false;
        showSummary();
        this.disabled = true; // Disable the button after showing the summary
    }

    // Stop the sound when moving to the next question
    const sound = document.getElementById('timer-sound');
    sound.pause(); // Pause the sound
    sound.currentTime = 0; // Reset the sound to the beginning
});

// document.getElementById('mute-button').addEventListener('click', function() {
//     const sound = document.getElementById('timer-sound');
//     isMuted = !isMuted;
//     sound.muted = isMuted;
//     this.textContent = isMuted ? 'Unmute' : 'Mute';
// });

document.getElementById('mute-button').addEventListener('click', function() {
    const sound = document.getElementById('timer-sound');
    sound.muted = !sound.muted;
    // Toggle button appearance based on mute state
    if (sound.muted) {
        this.innerHTML = '🔇'; // Unicode mute icon
        this.classList.add('muted');
    } else {
        this.innerHTML = '🔈'; // Unicode speaker icon
        this.classList.remove('muted');
    }
});

function startTimer(seconds) {
    clearInterval(interval);
    extraTimeStarted = false;
    questionStartTime = Date.now();
    secondsElapsed = 0;
    
    interval = setInterval(function() {
        secondsElapsed = Math.round((Date.now() - questionStartTime) / 1000);
        let secondsLeft = seconds - secondsElapsed;
        displayTime(secondsLeft);

        // Update the progress bar here (if you have one)

        // Check if time is up for the question
        if (secondsLeft <= 0) {
            if (!extraTimeStarted) {
                extraTimeStarted = true;
                playSound(); // Play the sound when time is up for the first time
            }
            // Optionally, handle extra time logic here
        }
    }, 1000);

    // Reset and enable/disable relevant buttons
    document.getElementById('pause-timer').disabled = false;
    document.getElementById('reset-timer').disabled = false;
    document.getElementById('start-timer').disabled = true;
}

function playSound() {
    const sound = document.getElementById('timer-sound');
    if (sound) {
        sound.play().catch(e => console.error("Error playing sound: ", e));
    }
}

function displayTime(seconds) {
    let minutes = Math.floor(Math.abs(seconds) / 60);
    let remainingSeconds = Math.abs(seconds) % 60;
    let timeString = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;

    if (seconds < 0) {
        timeString = '-' + timeString;
    }

    document.getElementById('time-remaining').textContent = timeString;
    let progress = ((avgTime * 60 - Math.abs(seconds)) / (avgTime * 60)) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

function resetTimer() {
    clearInterval(interval);
    secondsElapsed = 0;
    extraTimeStarted = false;
    isPaused = false;
    isTimerActive = false;
    currentQuestion = 0;
    document.getElementById('current-question').textContent = '0';
    document.getElementById('total-questions').textContent = questionCount;
    document.getElementById('time-remaining').textContent = "0:00";
    document.getElementById('progress-bar').style.width = `0%`;
    document.getElementById('start-timer').disabled = false;
    document.getElementById('pause-timer').disabled = true;
    document.getElementById('pause-timer').textContent = 'Pause';
    document.getElementById('reset-timer').disabled = true;
    document.getElementById('next-question').textContent = 'Next Question';
    document.getElementById('next-question').disabled = false;
    document.getElementById('summary').hidden = true;
}

function showSummary() {
    let totalTime = 0;
    let summaryText = '<div class="summary-header">Exam Summary:</div>';
    let minTime = Infinity;
    let maxTime = -Infinity;
    let minQuestion = 0;
    let maxQuestion = 0;

    // Calculate total time and find min/max times
    questionTimes.forEach((time, index) => {
        totalTime += time;
        if (time < minTime) {
            minTime = time;
            minQuestion = index + 1;
        }
        if (time > maxTime) {
            maxTime = time;
            maxQuestion = index + 1;
        }
        // Wrap the time in a span with red color if more than average
        let timeColor = time > avgTime ? ' style="color: red;"' : '';
        summaryText += `Question ${index + 1}: <span${timeColor}>${time} sec</span><br>`;
    });

    let totalMinutes = Math.floor(totalTime / 60);
    let totalSeconds = totalTime % 60;

    summaryText += `<br>Total Time: ${totalMinutes} min and ${totalSeconds} sec<br>`;
    summaryText += `Least Time: Q${minQuestion} with ${minTime} sec<br>`;
    summaryText += `Most Time: Q${maxQuestion} with ${maxTime} sec<br>`;

    // Display the summary
    document.getElementById('summary-text').innerHTML = summaryText; // Use innerHTML to render the HTML content
    document.getElementById('summary').style.display = 'block'; // Show Summary
}