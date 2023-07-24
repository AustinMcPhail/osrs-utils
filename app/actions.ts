'use server'

export async function detectItems(data: FormData) {
    console.log({ data })
    const file = data.get('image') as File
    if (!file) {
        throw new Error('No file found in form data')
    }
    // try {
    //     const src = await cv.matFromImageData(image)
    //     console.log({ src })
    // } catch (err) {
    //     console.log(cvTranslateError(cv, err))
    // }
    // let image: ImageData
    // convert File to ImageDate;
}
