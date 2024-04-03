import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';


@Component({
  selector: 'app-voice-recorder',
  templateUrl: './voice-recorder.component.html',
  styleUrls: ['./voice-recorder.component.scss']
})
export class VoiceRecorderComponent implements OnInit {

  @ViewChild('audioPlayer') audioPlayer: ElementRef;
  @ViewChild('playButton') playButton: ElementRef;
  @ViewChild('forwardButton') forwardButton: ElementRef;
  @ViewChild('backwardButton') backwardButton: ElementRef;

  mediaRecorder: MediaRecorder;
  chunks: Blob[] = [];
  isRecording: boolean = false;
  audioUrl = ""

  isPlaying = false;
  currentTime = 0;

  constructor() { }

  ngOnInit(): void {
    
  }

  startRecording() {
    const types = [
      "audio/aac",
      "audio/m4a",
      "audio/mp3",
      "audio/mp4",
      "video/webm",
      "audio/wav"
    ];
    let mimeType = null;
    for (const type of types) {
        if(MediaRecorder.isTypeSupported(type)){
          mimeType = type;
          break;
        }
    }
    navigator.mediaDevices.getUserMedia({ audio: true})
      .then(stream => {
        this.mediaRecorder = new MediaRecorder(stream, { mimeType: mimeType });

        console.log('MediaRecorder.mimeType: ', mimeType);
        this.mediaRecorder.ondataavailable = (e: any) => {
          this.chunks.push(e.data);
          console.log("chunk size: ", this.chunks.length);
          console.log("e.data: ", e.data);
          console.log("e", e);
        };

        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.chunks, { type: mimeType });
          const audioURL = window.URL.createObjectURL(blob);
          this.audioPlayer.nativeElement.src = audioURL;
          console.log('Stopped recording');
          this.chunks = [];
          
        };

        this.mediaRecorder.onpause = () => {
          const blob = new Blob(this.chunks, { type: mimeType });
          const audioURL = window.URL.createObjectURL(blob);
          this.audioPlayer.nativeElement.src = audioURL;
          console.log('Paused recording');
        };

        this.mediaRecorder.onerror= (e) => {
          console.error(' custom Error: ', e);
        };

        //trying adding timeslice (it will call ondataavailable every 5 seconds automatically)
        this.mediaRecorder.start(100);
        this.isRecording = true;
      })
      .catch(error => {
        console.error('Error accessing the microphone: ', error);
      });
  }

  pauseRecording() {
    if (this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.isRecording = false;
      this.currentTime = 0;
      this.playButton.nativeElement.disabled = false;
    }
  }

  resumeRecording() {
    this.audioPlayer.nativeElement.src = "";
    if (this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.isRecording = true;
      this.playButton.nativeElement.disabled = true;
    }
  }

  stopRecording() {
    if (this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.playButton.nativeElement.disabled = false;
    }
  }


  playPause() {
    if (this.isPlaying) {
      this.audioPlayer.nativeElement.pause();
      this.playButton.nativeElement.textContent = 'Play';
    } else {
      this.audioPlayer.nativeElement.play();
      this.playButton.nativeElement.textContent = 'Pause';
    }
    this.isPlaying = !this.isPlaying;
  }
  
  forward(seconds: number) {
    this.currentTime = this.audioPlayer.nativeElement.currentTime;
    this.currentTime = Math.min(this.audioPlayer.nativeElement.duration, this.currentTime + seconds);
    this.audioPlayer.nativeElement.currentTime = this.currentTime;
  }
  
  backward(seconds: number) {
    this.currentTime = this.audioPlayer.nativeElement.currentTime;
    this.currentTime = Math.max(0, this.currentTime - seconds);
    this.audioPlayer.nativeElement.currentTime = this.currentTime;
  }

}
