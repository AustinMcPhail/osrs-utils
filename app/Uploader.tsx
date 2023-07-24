'use client'

import Image from 'next/image'
import { FormEvent, useRef, useState } from 'react'

export default function Uploader() {
    const [file, setFile] = useState<File>()
    const [width, setWidth] = useState<number>()
    const [height, setHeight] = useState<number>()
    const imageRef = useRef(null)
    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        // const formData = new FormData()
        if (!file) throw new Error('No image')
        // formData.append('image', file)
        // await detectItems(formData)

        // const image = await createImageBitmap(file)

        // try {
        //     const src = await cv.matFromImageData(image)
        //     console.log({ src })
        // } catch (err) {
        //     console.log(cvTranslateError(cv, err))
        // }
        // console.log({ ...image })
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="file"
                name="file"
                onChange={async (e) => {
                    if (e.target.files) {
                        const file = e.target.files[0]
                        setFile(file)
                    }
                }}
            />
            {file && (
                <>
                    <Image
                        width={500}
                        height={500}
                        src={URL.createObjectURL(file)}
                        alt="uploaded"
                        ref={imageRef}
                    />
                    <button>Analyze Tab</button>
                </>
            )}
        </form>
    )
}
