export const getItemByRef = async ref => {
    const data = await ref.get();
    return {
        ...data.data(),
        id: data.id,
    }
}