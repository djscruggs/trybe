import { useState, useRef, useEffect } from 'react'
import { handleFileUpload } from '~/utils/helpers'
const mimeType = 'video/webm; codecs="opus,vp8"'
interface VideoRecorderProps {
  onStart: () => void
  onStop: () => void
  onSave: (video: File | null) => void
  onFinish: () => void
}

const VideoRecorder = ({ onStart, onStop, onSave, onFinish }: VideoRecorderProps): JSX.Element => {
  const [permission, setPermission] = useState(true)

  const mediaRecorder = useRef(null)
  const liveVideoFeed = useRef(null)
  const videoUpload = useRef(null)
  const [recordingStatus, setRecordingStatus] = useState('inactive')
  const [stream, setStream] = useState<MediaStream | null>()
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoChunks, setVideoChunks] = useState([])

  // taken from https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
  const isMobileDevice = (): boolean => {
    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true })(navigator.userAgent || navigator.vendor || window.opera)
    return check
  }

  useEffect(() => {
    if (isMobileDevice()) {
      return
    }
    getCameraPermission().then(() => {
      setPermission(true)
    }).catch((err) => {
      console.log(err.message)
      setPermission(false)
    })
  }, [])

  // need this to handle setting video file during upload on mobile device
  useEffect(() => {
    if (isMobileDevice()) {
      onSave(videoFile)
    }
  }, [videoFile])

  const getCameraPermission = async (): Promise<void> => {
    setRecordedVideo(null)
    // get video and audio permissions and then stream the result media stream to the videoSrc variable
    if ('MediaRecorder' in window) {
      try {
        const videoConstraints = {
          audio: false,
          video: true
        }
        const audioConstraints = { audio: true }

        // create audio and video streams separately
        const audioStream = await navigator.mediaDevices.getUserMedia(
          audioConstraints
        )
        const videoStream = await navigator.mediaDevices.getUserMedia(
          videoConstraints
        )

        setPermission(true)
        // combine both audio and video streams

        const combinedStream = new MediaStream([
          ...videoStream.getVideoTracks(),
          ...audioStream.getAudioTracks()
        ])

        setStream(combinedStream)

        // set videostream to live feed player
        liveVideoFeed.current.srcObject = videoStream
      } catch (err) {
        alert(err.message)
      }
    } else {
      alert('The MediaRecorder API is not supported in your browser.')
    }
  }
  const reset = async (): Promise<void> => {
    setRecordedVideo(null)
    setVideoFile(null)
    setRecordingStatus('inactive')
    await getCameraPermission()
  }

  const startRecording = async (): Promise<void> => {
    if (onStart) {
      onStart()
    }
    setRecordedVideo(null)
    setRecordingStatus('recording')
    await getCameraPermission()

    const media = new MediaRecorder(stream, { mimeType })
    mediaRecorder.current = media

    mediaRecorder.current.start()

    const localVideoChunks = []

    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === 'undefined') return
      if (event.data.size === 0) return
      localVideoChunks.push(event.data)
    }
    console.log(mediaRecorder)
    setVideoChunks(localVideoChunks)
  }

  const stopRecording = (): void => {
    if (onStop) {
      onStop()
    }
    setRecordingStatus('recorded')

    mediaRecorder.current.stop()

    mediaRecorder.current.onstop = () => {
      const videoBlob = new Blob(videoChunks, { type: mimeType })
      setVideoFile(videoBlob)
      const videoUrl = URL.createObjectURL(videoBlob)

      setRecordedVideo(videoUrl)

      setVideoChunks([])
    }
  }
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    handleFileUpload(e, setVideoFile, setRecordedVideo)
  }
  const saveVideo = (): void => {
    onSave(videoFile)
    const tracks = stream.getTracks()
    if (tracks) {
      tracks.forEach(track => { track.stop() })
    }
    setStream(null)
    if (liveVideoFeed?.current?.srcObject) {
      liveVideoFeed.current.srcObject = null
    }
    onFinish()
  }
  console.log(liveVideoFeed)
  const fileInput = (): JSX.Element => {
    const textColor = 'white'
    return (
      <input type="file"
        name="video"
        ref={videoUpload}
        onChange={handleVideoUpload}
        accept="video/*"
        capture
        className={`text-sm text-${textColor}
                  file:text-white
                    file:mr-5 file:py-2 file:px-6
                    file:rounded-full file:border-0
                    file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-700
                    file:cursor-pointer file:bg-blue
                    hover:file:bg-red`}
      />
    )
  }
  return (
    <>
    {isMobileDevice()
      ? (
        <>
          {recordedVideo
            ? (
                  <div className="mb-4">
                    <video className="recorded" src={recordedVideo} controls></video>
                  </div>
              )
            : null
          }
          <div className="flex flex-col items-center justify-end">
            <p className="text-2xl text-blue-gray-500 text-center">{recordedVideo ? 'Choose a different video' : 'Record or upload a video'}</p>
            <div className='mt-10 ml-36'>
              {fileInput()}
            </div>
          </div>

        </>
        )
      : (
      <>
        {!permission
          ? (
                  <p>Allow access to your camera to record a video</p>
            )
          : null}
      <div className="block min-h-[310px] relative justifys-center">

            {!recordedVideo &&
              <div className='border-2 border-gray-300 rounded-lg h-[3'>
                <video ref={liveVideoFeed} autoPlay></video>
              </div>
            }
            {recordedVideo
              ? (

                  <video className="h-full" src={recordedVideo} controls></video>

                )
              : null}

      </div>
      <div className='w-full flex justify-center'>
        {recordingStatus === 'inactive' &&
          <>
          <button className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded' onClick={startRecording} type="button">
              Start Recording
          </button>
          <button className='bg-red hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-2' onClick={onFinish} type="button">
            Never Mind
          </button>
          </>
        }
        {recordingStatus === 'recording' &&
            <button className='bg-red hover:bg-green-700 text-white font-bold py-2 px-4 rounded' onClick={stopRecording} type="button">
              Stop Recording
            </button>
        }
        {recordingStatus === 'recorded' &&
          <>
          <button className='bg-red text-white font-bold py-2 px-4 rounded' onClick={reset} type="button">
            Discard
          </button>
          <button className='bg-green-700 text-white font-bold py-2 px-4 rounded ml-2' onClick={saveVideo} type="button">
            Looks Good 👍
          </button>
          </>
        }
      </div>
      </>
        )}
    </>
  )
}

export default VideoRecorder