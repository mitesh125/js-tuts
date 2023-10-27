// function chai() {
//     let username = "Mitesh"
//     console.log(username);
// }
// chai()
const chai = () => {
    let username = "Mitesh"
    console.log(this.username);
}

// const addTwo = (num1, num2) => num1 + num2

// const addTwo = (num1, num2) => (num1 + num2)

const addTwo = (num1, num2) => ({username:"Mitesh"})
console.log(addTwo(8,8))

const myarray = [2,6,9,7,5,6,7]
// myarray.forEach(fun)
