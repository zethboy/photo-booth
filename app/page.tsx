
"use client";

import { resolve } from "path";
import { useRef, useState } from "react" 
import Stream from "stream";

export default function photoBooth () {

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startCamera = async () => {

    try {
      const stream = await navigator.mediaDevices.getUserMedia({video:true})
      console.log("ref video", videoRef.current)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream as MediaStream
        videoRef.current.play();
      }
    } catch(err){
      console.error("gagal mengakses kamera :", err)
    }
  }

  const [photos, setPhotos] = useState<string[]>([])

  const capturePhoto = () => {
      if(!videoRef.current) return
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext("2d")
      if(ctx){
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
        const imageUrl = canvas.toDataURL("image/png")

        setPhotos((prev) => (prev.length < 3 ? [...prev, imageUrl] : prev))
      }
   }

  const [finalPhoto, setFinalPhoto] = useState<string | null>(null)

  const combinePhotos = async () => {

    console.log("proses bosku")

    if(photos.length < 3) {
      alert ("ambil mminimal 3 bosku")
      return
    }

    console.log("poto cukup")
    const canvas = document.createElement("canvas")
    const borderSize = 0
    const imgWidth = 300
    const imgHeight = 210
    canvas.width =  imgWidth * 3 + borderSize * 4
    canvas.height = imgHeight  + borderSize * 2
    const ctx = canvas.getContext("2d")
    

    if (!ctx){
      console.log("gadapet context canvas")
      return
    } 
    console.log("canvas aman")
    const loadImage = (src : string) => {
      return new Promise<HTMLImageElement>((resolve)=>{
        const img = new Image()
        img.src = src;
        img.onload = () =>{
          console.log("gambar dimuat")
          resolve(img)}
          img.onerror = (err) => {
            console.error("❌ Gagal memuat gambar:", src, err);
          };
       }
      )
       
      
    }

try {
  console.log("muat gambar")
    const images = await Promise.all(photos.map(loadImage)); 
    console.log("udah dimuat")   

    const colors = ["red", "blue", "green", "yellow", "purple", "orange"];


    images.forEach((image, index) => {
      const borderColor = colors[index % colors.length]; // Pilih warna dari array
      ctx.fillStyle = borderColor;
      ctx.fillRect(index * imgWidth, 0, imgWidth, imgHeight); 
      ctx.drawImage(image, index * imgWidth + 5, 5, imgWidth - 10, imgHeight - 10);
      console.log(`✅ Gambar ${index + 1} ditambahkan ke canvas!`)   
    });

    // Simpan hasilnya
    const finalImage = canvas.toDataURL("image/png");
    setFinalPhoto(finalImage);
  } catch (error) {
    console.error("Gagal memuat gambar:", error);
}
}

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4" >Giogi PhotoBooth</h1>
      <video ref={videoRef} id="video" style={{transform: "scaleX(-1)"}} autoPlay playsInline className="border-white border-2 h-auto w-full max-w-md"></video>
      <button onClick={startCamera} className="mt-4 bg-green-500 px-4 py-2 rounded-lg text-white hover:bg-green-400">Aktifkan Kamera</button>
      <button onClick={capturePhoto} className="bg-blue-600 text-white px-4 py-2 mt-2 rounded">Ambil foto</button>
      <button onClick={combinePhotos} className="bg-purple-600 px-4 py-2 mt-2 rounded">Gabungkan foto</button>
      
      {finalPhoto && (
        <div className="mt-4">
          <h2 className="text-white">Hasil</h2>
          <img src={finalPhoto} alt="gabungan foto" className="" />
        </div>
      )}
      
      <div className="flex gap-2 mt-4">
        {photos.map((photo, index)=>(
          <img key={index} src={photo} alt={`Foto ${index}`} className="w-32 h-32 object-cover border" />
        ))}
      </div>

    </div>
  )
}