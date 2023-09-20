async function myErroFunction() {
  throw new Error('Error');
}

async function myErroFunction2() {
  try {
    await myErroFunction();
  } catch (error) {
    throw new Error("Error 2", {cause: error})
  }
}

myErroFunction2()
