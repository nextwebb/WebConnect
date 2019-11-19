let person1 = {
    goal: 10 ,
	time: 1000,
    
	firstName: {
        time: 3000,
        run : function() {
            //let object = this.firstName
        return this.time
    }
}}

person1.firstName.run.call(person1)// 1000

person1.firstName.run() // 3000

// using the this keyword we must know how , where and what object is calling the function.