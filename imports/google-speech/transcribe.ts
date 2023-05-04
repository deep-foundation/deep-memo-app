export default async function transcribe(deep, soundLinks) {
  const transcribeTypeLinkId = await deep.id("@deep-foundation/google-speech", "Transcribe");
  const containTypeLinkId = await deep.id('@deep-foundation/core', 'Contain');

  const {data} = await deep.insert(soundLinks.map((soundLinkId) => ({
    type_id: transcribeTypeLinkId,
    from_id: deep.linkId,
    to_id: soundLinkId,
    in: {
      data: {
        type_id: containTypeLinkId,
        from_id: deep.linkId,
      }
    }
  })))
  console.log(data);
}