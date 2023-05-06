

const mysql=require("mysql");
const express=require("express");
const bodyParser=require('body-parser');
const app=express();
app.set('view engine', 'ejs');
const connection=mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "epics",
    password: 'Shannu@18'
  

});

var nodemailer = require('nodemailer');
app.use(express.static("asset"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static("public"));







//connecting to the database
connection.connect(function(error){
    if(error) throw error
    else console.log("connected to database successfully!!");

   
});

app.get("/",function(req,res){
   //  res.sendFile(__dirname + "/login.html");
   res.sendFile(__dirname + "/index.html");
   //alert("hi:");


})

app.post("/",function(req,res){
    var username=req.body.name;
    console.log(username);
    var password=req.body.password;
    var email=req.body.email;
    console.log(email);
    var phno=Number(req.body.phno);
    var aadhar=Number(req.body.aadhar);
    console.log(aadhar);
    var loc=req.body.sublocality;
    var dist=req.body.dist;
    var state=req.body.state;
    console.log(phno);

    
    var sql="INSERT INTO publiclogin(public_name,public_email,public_pass,public_no,public_aadhar,public_locality,public_district,public_State) VALUES ?";
     var VALUES=[
       [username,email,password,phno,aadhar,loc,dist,state]
       // ['shanmukh','bshanmukhi18@gmail.com','shannu',83282831]
     ]
   


    connection.query("select * from publiclogin where public_name = ? and public_pass = ? and public_email = ?",[username,password,email],function(error,results,fields){
     
        if(results.length>=1){
            console.log("Already Existed");
            res.redirect("/login.html");
        }
        else{

            
            const regex = /^[a-zA-Z0-9_.+-]+@gmail\.com$/;
        if (!regex.test(email) || String(phno).length !== 10 || String(aadhar).length !== 12) {
          console.log("Invalid address");
          res.redirect("/login.html");
        }
            else{
            

            connection.query(sql,[VALUES],function(err,result){
                //connection.query(sql,function(err,result){
                 if(err)
                     throw err;
                 else 
                 {
                    console.log(result.affectedRows);
                    console.log(phno);
                    console.log(email);
                    

                }
                connection.query("select public_id from publiclogin where public_no=? and public_email=?",[phno,email],function(err,resu){
                    var data=JSON.parse(JSON.stringify(resu));
                    console.log(resu);
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                          user: 'shannub18@gmail.com',
                          pass: 'fqygckhkfnacllub'
                        }
                      });
                      
                      var mailOptions = {
                        // from: 'shannub18@gmail.com',
                        from:'shannub18@gmail.com',
                        to:email,
                        subject: 'Registration in public grievance portal',
                        text: 'You have registered successfully to public grievance portal.Your Registration id is'+data[0].public_id
                      };
                      
                      transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                          console.log(error);
                        } else {
                          console.log('Email sent: ' + info.response);
                        }
                      });
                })
             })
             res.redirect("/public.html");
        }
    }
    })

   
})

app.get("/public.html",function(req,res){

    res.sendFile(__dirname + "/public.html");
  

})


app.get("/pubWelcome.html",function(req,res){
    res.sendFile(__dirname + "/pubWelcome.html");
})


app.get("/pubcomp.html",function(req,res){
         
         res.sendFile(__dirname + "/pubcomp.html");






    })



app.post("/complog.html",function(req,res){
      var email=req.body.email;
      console.log(email);
      var pass=req.body.pass;
      console.log(pass);
      connection.query("select * from publiclogin where  public_pass = ? and public_email = ?",[pass,email],function(error,result,fields){
        console.log(result.length);
         if(result.length>=1)
        {
            console.log("exist");
             
            res.redirect("/public.html");
             //res.write("Already Existed!!");
        }
        else{
            console.log(email);
            console.log(pass);
           res.redirect("/public.html");
           //res.write("lo");
        }
        res.end();
    })


})



app.listen(3000,function(res,req){
    console.log("server running on port 3000");
})

app.get("/login.html",function(req,res){
    res.sendFile(__dirname + "/login.html");
})

app.get("/contact.html",function(req,res){
    res.sendFile( __dirname + "/contact.html");


})

app.get("/complog.html",function(req,res){
    res.sendFile(__dirname + "/complog.html");
})

app.get("/midgroup.html",function(req,res){
    res.sendFile( __dirname + "/midgroup.html");


})

app.get("/signin.html",function(req,res){
    res.sendFile(__dirname+"/complog.html")
})

app.get("/Departments.html",function(req,res){
    res.sendFile(__dirname+"/Departments.html")
})

app.get("/munLogin.html",function(req,res){
    res.sendFile(__dirname+"/munLogin.html")
})

app.get("/policeLogin.html",function(req,res){
    res.sendFile(__dirname+"/policeLogin.html")
})

app.post("/policeLogin.html",function(req,res){
    var id=req.body.polid;
    var loc=req.body.loc;
    var dist=req.body.dist;
    var state=req.body.state;
    connection.query("select * from policedept where polst_id=? and polst_local=? and polst_dist=? ",[id,loc,dist],function(err,results){
        if(err){
            throw err;
        }
        else{
            // res.redirect("/police");

            connection.query("SELECT * FROM publiclogin INNER JOIN pubcomplaint ON pubcomplaint.public_id=publiclogin.public_id where c_dept='pol' and public_locality=?  order by c_id desc",loc,function(error,results){
                if(error){
                    throw error;
                }
                else{
                    var data1=JSON.parse(JSON.stringify(results));
                  connection.query("select status,COUNT(c_id) AS c from pubcomplaint INNER JOIN publiclogin ON pubcomplaint.public_id=publiclogin.public_id where c_dept='pol' and public_locality=? group by status ",loc,function(err,result){
                    if(err)
                       throw err;
                    else{
                        var arr=[];
                        var s=0,us=0,n=0,ip=0,t=0;
                        console.log(result.length);
                       var data=JSON.parse(JSON.stringify(result));
                       console.log(data);
                       
                       for(var i=0;i<result.length;i++){
                        console.log(data[i].status);
                            if(data[i].status==='solved'){
                                s=data[i].c;
                            }
                            else if(data[i].status==='inProgress'){
                                ip=data[i].c;
                            }
                            else if(data[i].status===null){
                                n=data[i].c;
                            }
                            else if(data[i].status==="willBeStartedSoon"){
                                us=data[i].c;
                            }
                       }
                    //    t=s+us+n+ip;
                       arr.push(s);
                       arr.push(us);
                       arr.push(n);
                       arr.push(ip);
                    //    arr.push(t);
                       console.log(arr);

        
                       res.render('pol',{a:arr,sampleData:data1,loc:loc});
        
                    }
                  })
        
        
                    
        
        }
        });
            

    }

        });

})



app.post("/munLogin.html",function(req,res){
    var id=req.body.polid;
    var loc=req.body.loc;
    var dist=req.body.dist;
    var state=req.body.state;
    connection.query("select * from muncipaldept where munst_id=? and mun_local=? and mun_dist=? ",[id,loc,dist],function(err,results){
        if(err){
            throw err;
        }
        else{
            // res.redirect("/police");

            connection.query("SELECT * FROM publiclogin INNER JOIN pubcomplaint ON pubcomplaint.public_id=publiclogin.public_id where c_dept='mun' and status!='solved' and public_locality=? order by c_id desc;",loc,function(error,results){
                if(error){
                    throw error;
                }
                else{
                    var data1=JSON.parse(JSON.stringify(results));
                  connection.query("select status,COUNT(c_id) AS c from pubcomplaint INNER JOIN publiclogin ON pubcomplaint.public_id=publiclogin.public_id where c_dept='mun'  and public_locality=? group by status ",loc,function(err,result){
                    if(err)
                       throw err;
                    else{
                        var arr=[];
                        var s=0,us=0,n=0,ip=0,t=0;
                        console.log(result.length);
                       var data=JSON.parse(JSON.stringify(result));
                       console.log(data);
                       
                       for(var i=0;i<result.length;i++){
                        console.log(data[i].status);
                            if(data[i].status==='solved'){
                                s=data[i].c;
                            }
                            else if(data[i].status==='inProgress'){
                                ip=data[i].c;
                            }
                            else if(data[i].status===null){
                                n=data[i].c;
                            }
                            else if(data[i].status==="willBeStartedSoon"){
                                us=data[i].c;
                            }
                       }
                    //    t=s+us+n+ip;
                       arr.push(s);
                       arr.push(us);
                       arr.push(n);
                       arr.push(ip);
                    //    arr.push(t);
                       console.log(arr);
        
                       res.render('mun',{a:arr,sampleData:data1,loc:loc});
        
                    }
                  })
        
        
                    
        
        }
        });
            

    }

        });

})



            

  

app.post("/revenueLogin.html",function(req,res){
    var id=req.body.polid;
    var loc=req.body.loc;
    var dist=req.body.dist;
    var state=req.body.state;
    connection.query("select * from revenuedept where rev_id=? and rev_local=? and rev_dist=? ",[id,loc,dist],function(err,results){
        if(err){
            throw err;
        }
        else{
            // res.redirect("/police");

            connection.query("SELECT * FROM publiclogin INNER JOIN pubcomplaint ON pubcomplaint.public_id=publiclogin.public_id where c_dept='rev' and public_locality=? order by c_id desc;",loc,function(error,results){
                if(error){
                    throw error;
                }
                else{
                    var data1=JSON.parse(JSON.stringify(results));
                  connection.query("select status,COUNT(c_id) AS c from pubcomplaint INNER JOIN publiclogin ON pubcomplaint.public_id=publiclogin.public_id where c_dept='rev' and public_locality=? group by status ",loc,function(err,result){
                    if(err)
                       throw err;
                    else{
                        var arr=[];
                        var s=0,us=0,n=0,ip=0,t=0;
                        console.log(result.length);
                       var data=JSON.parse(JSON.stringify(result));
                       console.log(data);
                       
                       for(var i=0;i<result.length;i++){
                        console.log(data[i].status);
                            if(data[i].status==='solved'){
                                s=data[i].c;
                            }
                            else if(data[i].status==='inProgress'){
                                ip=data[i].c;
                            }
                            else if(data[i].status===null){
                                n=data[i].c;
                            }
                            else if(data[i].status==="willBeStartedSoon"){
                                us=data[i].c;
                            }
                       }
                    //    t=s+us+n+ip;
                       arr.push(s);
                       arr.push(us);
                       arr.push(n);
                       arr.push(ip);
                    //    arr.push(t);
                       console.log(arr);
        
                       res.render('rev',{a:arr,sampleData:data1});
        
                    }
                  })
        
        
                    
        
        }
        });
            

    }

        });

})



app.post("/Womlog.html",function(req,res){
    var id=req.body.polid;
    var loc=req.body.loc;
    var dist=req.body.dist;
    var state=req.body.state;
    connection.query("select * from womendept where women_id=? and women_local=? and women_dist=? ",[id,loc,dist],function(err,results){
        if(err){
            throw err;
        }
        else{
            // res.redirect("/police");

            connection.query("SELECT * FROM publiclogin INNER JOIN pubcomplaint ON pubcomplaint.public_id=publiclogin.public_id where c_dept='women' and public_locality=? order by c_id desc;",loc,function(error,results){
                if(error){
                    throw error;
                }
                else{
                    var data1=JSON.parse(JSON.stringify(results));
                  connection.query("select status,COUNT(c_id) AS c from pubcomplaint INNER JOIN publiclogin ON pubcomplaint.public_id=publiclogin.public_id where c_dept='women' and public_locality=? group by status ",loc,function(err,result){
                    if(err)
                       throw err;
                    else{
                        var arr=[];
                        var s=0,us=0,n=0,ip=0,t=0;
                        console.log(result.length);
                       var data=JSON.parse(JSON.stringify(result));
                       console.log(data);
                       
                       for(var i=0;i<result.length;i++){
                        console.log(data[i].status);
                            if(data[i].status==='solved'){
                                s=data[i].c;
                            }
                            else if(data[i].status==='inProgress'){
                                ip=data[i].c;
                            }
                            else if(data[i].status===null){
                                n=data[i].c;
                            }
                            else if(data[i].status==="willBeStartedSoon"){
                                us=data[i].c;
                            }
                       }
                    //    t=s+us+n+ip;
                       arr.push(s);
                       arr.push(us);
                       arr.push(n);
                       arr.push(ip);
                    //    arr.push(t);
                       console.log(arr);
        
                       res.render('women',{a:arr,sampleData:data1});
        
                    }
                  })
        
        
                    
        
        }
        });
            

    }

        });

})
app.get("/revenueLogin.html",function(req,res){
    res.sendFile(__dirname+"/revenueLogin.html")
})

app.get("/Womlog.html",function(req,res){
    res.sendFile(__dirname+"/Womlog.html")
})

app.get("/index.html",function(req,res){
    res.sendFile(__dirname+"/index.html")
})


app.post("/pubcomp.html",function(req,res){

   var dept=req.body.dept;
   var com=req.body.comp;
var id=req.body.regid;
   var id;
   var pcid;


        connection.query("select * from pubcomplaint where public_id=? and complaint=?;",[id,com],function(err,results){
            if(err)
            throw err;
           else{
               if(results.length<1){
                  
                
                connection.query("select public_locality,public_district,public_State,public_email from publiclogin where public_id=?",id,function(err,resul){
                    if(err)
                         throw err;
                      else{
                          console.log(resul);
                          var data=JSON.parse(JSON.stringify(resul))
                          var loc=data[0].public_locality;
                          var dist=data[0].public_district;
                          var state=data[0].public_State;
                          var pubmail=data[0].public_email;
                          console.log(loc);
                         
                         
                          connection.query("select * from policedept where polst_local=? and polst_dist=?",[loc,dist],function(err,results){
                           
        
                              if(err)
                                  throw err;
                              else{
                                 
                                 console.log(results);
                                 var data1=JSON.parse(JSON.stringify(results));
                                var polemail=data1[0].pol_email;
                                var polstid=data1[0].polst_id;
                              }
                              connection.query("select polemp_id from polemp where polst_id=? order by compcount limit 1",polstid,function(err,results){
                           
        
                                if(err)
                                    throw err;
                                else{
                                   
                                   console.log(results);
                                   var data1=JSON.parse(JSON.stringify(results));
                                  var assignedpol=data1[0].polemp_id;
                                  
                                 

                                
                                }
                            
                              
                              connection.query("select * from revenuedept where rev_local=? and rev_dist=?",[loc,dist],function(err,results){
                           
        
                                if(err)
                                    throw err;
                                else{
                                   
                                   console.log(results);
                                   var data1=JSON.parse(JSON.stringify(results));
                                //   var polemail=data1[0].pol_email;
                                   var revid=data1[0].rev_id;
                                }

                                connection.query("select revemp_id from revemp where rev_id=? order by compcount limit 1",revid,function(err,results){
                           
        
                                    if(err)
                                        throw err;
                                    else{
                                       
                                       console.log(results);
                                       var data1=JSON.parse(JSON.stringify(results));
                                      var assignedrev=data1[0].revemp_id;
                                      
                                     
    
                                    
                                    }
                                connection.query("select * from muncipaldept where mun_local=? and mun_dist=?",[loc,dist],function(err,results){
                           
        
                                    if(err)
                                        throw err;
                                    else{
                                       
                                       console.log(results);
                                       var data1=JSON.parse(JSON.stringify(results));
                                    //   var polemail=data1[0].pol_email;
                                       var munid=data1[0].munst_id;
                                    }

                                    connection.query("select munemp_id from munemp where munst_id=? order by compcount limit 1",munid,function(err,results){
                           
        
                                        if(err)
                                            throw err;
                                        else{
                                           
                                           console.log(results);
                                           var data1=JSON.parse(JSON.stringify(results));
                                          var assignedmun=data1[0].munemp_id;
                                          
                                         
        
                                        
                                        }
                                    connection.query("select * from womendept where women_local=? and women_dist=?",[loc,dist],function(err,results){
                           
        
                                        if(err)
                                            throw err;
                                        else{
                                           
                                           console.log(results);
                                           var data1=JSON.parse(JSON.stringify(results));
                                        //   var polemail=data1[0].pol_email;
                                           var womenid=data1[0].women_id;
                                        }

                                        connection.query("select womemp_id from womemp where women_id=? order by compcount limit 1",womenid,function(err,results){
                           
        
                                            if(err)
                                                throw err;
                                            else{
                                               
                                               console.log(results);
                                               var data1=JSON.parse(JSON.stringify(results));
                                              var assignedwom=data1[0].womemp_id;
                                              
                                             
            
                                            
                                            }
                                        console.log(revid+womenid+"      "+munid+polstid);
                                        let date_time = new Date();


                                       let date = ("0" + date_time.getDate()).slice(-2);


                                      let month = ("0" + (date_time.getMonth() + 1)).slice(-2);


                                          let year = date_time.getFullYear();
                                          var day=date+"-"+month+"-"+year;

                var sql="INSERT INTO pubcomplaint(public_id,c_dept,complaint,pol_id,rev_id,mun_id,women_id,comp_date,asspol_id,assrev_id,assmun_id,asswom_id) VALUES ?";
                var VALUES=[
                  [id,dept,com,polstid,revid,munid,womenid,day,assignedpol,assignedrev,assignedmun,assignedwom]
                 
                ]
                connection.query(sql,[VALUES],function(err,result){
                 //connection.query(sql,function(err,result){
                  if(err)
                      throw err;
                  else {
                  console.log(result.affectedRows);
             
                   console.log(id);
                   console.log(com);
                 //  connection.query("SELECT publiclogin.public_locality,publiclogin.public_district , publiclogin.public_State FROM publiclogin INNER JOIN pubcomplaint ON pubcomplaint.public_id=? and pubcomplaint.complaint=?;",[id,com],function(err,resul){
                  
                 
             
                  }
                })
                connection.query("select c_id from pubcomplaint where public_id=? and complaint=?",[id,com],function(err,resultt){
                    var data=JSON.parse(JSON.stringify(resultt));
                    console.log(data);
                     pcid=data[0].c_id;
                     console.log(pcid);
                  
                   
                    //  res.send(`your Registration id is ${pcid}.You can track your complaint status using this`);
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                          user: 'shannub18@gmail.com',
                          pass: 'fqygckhkfnacllub'
                        }
                      });
                      
                      var mailOptions = {
                         from: 'shannub18@gmail.com',
                         
                        to:  pubmail,
                        subject: 'Mail from Public Grievance portal',
                        text: 'Your complaint has been received and your Complaint id is'+ pcid+'.You can use this id to complaint to higher authority if your problem is not solved'
                      };
                      
                      transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                          console.log(error);
                        } else {
                          console.log('Email sent: ' + info.response);
                        }
                      });
                      res.redirect("/public.html");
                    
                   
                })
            })
        })
                })
               })
               
            })
        })
    })
})
         }
     })






 }
}
    }) 
 

}
  )
  


app.get("/viewStatus.html",function(req,res){
    res.sendFile(__dirname+"/viewStatus.html");
})

app.post("/viewStatus.html",function(req,res){
    // var email=req.body.email;
    // var pass=req.body.pass;
    var id=req.body.regid;

   
         
        connection.query("SELECT * FROM  pubcomplaint  where public_id=?",id,function(err,results){
    
            if(err)
                throw err;
            else{
               
               console.log(results);
               var data1=JSON.parse(JSON.stringify(results));
               console.log(data1);
               console.log(data1[0].complaint);
               res.render('view',{title:"My Complaint Status",sampleData:data1});
 
}

})
})

app.post("/pubchat.html",function(req,res){
    var cid=req.body.cid;
    console.log(cid);
    connection.query("SELECT * FROM publiclogin INNER JOIN pubcomplaint ON pubcomplaint.public_id=publiclogin.public_id where  c_id=? order by c_id desc;",cid,function(err,results){
        if(err)
            throw err;
        else{
           
                 
                   console.log(results.length);
                   var  data=JSON.parse(JSON.stringify(results));
                  
                    connection.query("SELECT * FROM messages WHERE cid=? order by id ;",cid,function(err,result){
                        if(err)
                            throw err;
                        else{
                           
                                 
                                   console.log(result.length);
                                   var data1=JSON.parse(JSON.stringify(result));
                                   console.log(data1.length);
                                   res.render("pubchat",{sampleData:data,Data:data1});
                                  
                                }
                            })
                           
                  
                  
                }
            })
})
           


app.get("/police",function(req,res){

   
   
  // connection.query("select * from pubcomplaint   where c_dept = 'pol'  order by c_id desc;",function(error,results){
    connection.query("SELECT * FROM publiclogin INNER JOIN pubcomplaint ON pubcomplaint.public_id=publiclogin.public_id where c_dept='pol' order by c_id desc;",function(error,results){
        if(error){
            throw error;
        }
        else{
            var data1=JSON.parse(JSON.stringify(results));
          connection.query("select status,COUNT(c_id) AS c from pubcomplaint where c_dept='pol' group by status ",function(err,result){
            if(err)
               throw err;
            else{
                var arr=[];
                var s=0,us=0,n=0,ip=0,t=0;
                console.log(result.length);
               var data=JSON.parse(JSON.stringify(result));
               console.log(data);
               
               for(var i=0;i<result.length;i++){
                console.log(data[i].status);
                    if(data[i].status==='solved'){
                        s=data[i].c;
                    }
                    else if(data[i].status==='inProgress'){
                        ip=data[i].c;
                    }
                    else if(data[i].status===null){
                        n=data[i].c;
                    }
                    else if(data[i].status==="willBeStartedSoon"){
                        us=data[i].c;
                    }
               }
            //    t=s+us+n+ip;
               arr.push(s);
               arr.push(us);
               arr.push(n);
               arr.push(ip);
            //    arr.push(t);
            console.log(arr.length);
               console.log(arr);

               res.render('pol',{a:arr,sampleData:data1});

            }
          })


            

}
});
    

})

app.post("/police",function(req,res){
  
    
    console.log("efgb");
    var status=req.body.status;
    console.log(status);
   var cid=Number(req.body.cid);
   var fin=req.body.findate;
   console.log(cid);
   var polid=Number(req.body.pol);
//    var polid=Number(req.body.cid);
//    console.log(polid);


       
            connection.query("UPDATE pubcomplaint SET status = ? WHERE c_id=? ;",[status,cid],function(err,results){
                if(err)
                throw err;
               else{
                   console.log("d");
               }
            })
        if(fin){
            connection.query("UPDATE pubcomplaint SET fin_date = ? WHERE c_id=? ;",[fin,cid],function(err,results){
                if(err)
                throw err;
               else{
                   console.log("d");
               }
            })
        }
       
         
            
            
    
   

connection.query("select pol_id,public_id from pubcomplaint where c_id=?",cid,function(err,results){
    if(err)
    throw err;
   else{
      
        var dat=JSON.parse(JSON.stringify(results));
        console.log(dat);
        console.log(dat[0].public_id);
        connection.query("select public_email from publiclogin where public_id=?",dat[0].public_id,function(err,res){
            if(err) throw err;
            var d=JSON.parse(JSON.stringify(res));
             var email=d[0].public_email;
             console.log(email);
             connection.query("select pol_email,pol_pass from policedept where polst_id=?",dat[0].pol_id,function(error,resul){
                if(error) throw error;
                var da=JSON.parse(JSON.stringify(resul));
                var polema=da[0].pol_email;
                var polpass=da[0].pol_pass;
                console.log(polema);
                console.log(polpass);


                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: polema,
                      pass: polpass
                    }
                  });
                  
                  var mailOptions = {
                    // from: 'shannub18@gmail.com',
                    from: polema,
                    to: email,
                    subject: 'Mail from Public Grievance portal',
                    text: 'your complaint status has been updated'
                  };
                  
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });

             })
           
        })
   }

})



})



app.post("/Municipality.html",function(req,res){
  
    
    console.log("efgb");
    var status=req.body.status;
    console.log(status);
   var cid=Number(req.body.cid);
   console.log(cid);
   var polid=Number(req.body.pol);
//    var polid=Number(req.body.cid);
   console.log(polid);


connection.query("SELECT * FROM publiclogin INNER JOIN pubcomplaint ON pubcomplaint.public_id=publiclogin.public_id where c_dept='mun' and c_id=? order by c_id desc;",cid,function(err,results){
    if(err)
        throw err;
    else{
       
             
               console.log(results.length);
                data=JSON.parse(JSON.stringify(results));
              
                connection.query("SELECT * FROM messages WHERE cid=? order by id ;",cid,function(err,result){
                    if(err)
                        throw err;
                    else{
                       
                             
                               console.log(result.length);
                                data1=JSON.parse(JSON.stringify(result));
                               console.log(data1.length);
                               res.render("mundetcomp",{sampleData:data,Data:data1});
                              
                            }
                        })
                       
              
              
            }
        })



   

})
app.post("/muncipal",function(req,res){
  
    
    console.log("efgb");
    var status=req.body.status;
    console.log(status);
   var cid=Number(req.body.cid);
   var fin=req.body.findate;
   console.log(cid);
   var polid=Number(req.body.pol);
//    var polid=Number(req.body.cid);
//    console.log(polid);


       
            connection.query("UPDATE pubcomplaint SET status = ? WHERE c_id=? ;",[status,cid],function(err,results){
                if(err)
                throw err;
               else{
                   console.log("d");
               }
            })
        if(fin){
            connection.query("UPDATE pubcomplaint SET fin_date = ? WHERE c_id=? ;",[fin,cid],function(err,results){
                if(err)
                throw err;
               else{
                   console.log("d");
               }
            })
        }
       
         
            
            
    
   

connection.query("select mun_id,public_id from pubcomplaint where c_id=?",cid,function(err,results){
    if(err)
    throw err;
   else{
      
        var dat=JSON.parse(JSON.stringify(results));
        console.log(dat);
        console.log(dat[0].public_id);
        connection.query("select public_email from publiclogin where public_id=?",dat[0].public_id,function(err,res){
            if(err) throw err;
            var d=JSON.parse(JSON.stringify(res));
             var email=d[0].public_email;
             console.log(email);
             connection.query("select mun_email,mun_pass from muncipaldept where munst_id=?",dat[0].mun_id,function(error,resul){
                if(error) throw error;
                var da=JSON.parse(JSON.stringify(resul));
                var munema=da[0].mun_email;
                var munpass=da[0].mun_pass;
                console.log(munema);
                console.log(munema);


                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: munema,
                      pass: munpass
                    }
                  });
                  
                  var mailOptions = {
                    // from: 'shannub18@gmail.com',
                    from: munema,
                    to: email,
                    subject: 'Mail from Public Grievance portal',
                    text: 'Your status of complaint updated please check'
                  };
                  
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });

             })
           
        })
   }

})



})

app.post("/polstatus.html",function(req,res){
    var cid=req.body.cid;
   var data;
   var data1;

    connection.query("SELECT * FROM publiclogin INNER JOIN pubcomplaint ON pubcomplaint.public_id=publiclogin.public_id where c_dept='pol' and c_id=? order by c_id desc;",cid,function(err,results){
        if(err)
            throw err;
        else{
           
                 
                   console.log(results.length);
                    data=JSON.parse(JSON.stringify(results));
                  
                    connection.query("SELECT * FROM messages WHERE cid=? order by id ;",cid,function(err,result){
                        if(err)
                            throw err;
                        else{
                           
                                 
                                   console.log(result.length);
                                    data1=JSON.parse(JSON.stringify(result));
                                   console.log(data1.length);
                                   res.render("issue",{sampleData:data,Data:data1});
                                  
                                }
                            })
                           
                  
                  
                }
            })

           
          
          
        })

app.post("/chat.html",function(req,res){
    var msg="OFFICER:"+ req.body.msg;
    console.log(msg);
    var cid=req.body.cid;
    var datetime = new Date();
    VALUES=[
        [cid,msg, new Date()]
    ]
    connection.query("select * from messages where cid=? and content=?",[cid,msg],function(err,results){
        if(err)
            throw err;
        else{
           if(results.length>=1)
           {
            console.log("exists");
           }
           else{
            connection.query("INSERT INTO messages(cid, content, timestamp) Values ?",[VALUES],function(err,results){
                if(err)
                    throw err;
                else{
                   console.log("sent");
                   

                   
                  
                }
            })
           }
          
        }
    })
    
   
    
})



app.post("/Revenue.html",function(req,res){
  
    
    console.log("efgb");
    var status=req.body.status;
    console.log(status);
   var cid=Number(req.body.cid);
   console.log(cid);
   var polid=Number(req.body.pol);
//    var polid=Number(req.body.cid);
   console.log(polid);


connection.query("SELECT * FROM publiclogin INNER JOIN pubcomplaint ON pubcomplaint.public_id=publiclogin.public_id where c_dept='rev' and c_id=? order by c_id desc;",cid,function(err,results){
    if(err)
        throw err;
    else{
       
             
               console.log(results.length);
                data=JSON.parse(JSON.stringify(results));
              
                connection.query("SELECT * FROM messages WHERE cid=? order by id ;",cid,function(err,result){
                    if(err)
                        throw err;
                    else{
                       
                             
                               console.log(result.length);
                                data1=JSON.parse(JSON.stringify(result));
                               console.log(data1.length);
                               res.render("revdetcomp",{sampleData:data,Data:data1});
                              
                            }
                        })
                       
              
              
            }
        })


   

})

app.post("/revenue",function(req,res){
  
    
    console.log("efgb");
    var status=req.body.status;
    console.log(status);
   var cid=Number(req.body.cid);
   var fin=req.body.findate;
   console.log(cid);
   var polid=Number(req.body.pol);
//    var polid=Number(req.body.cid);
//    console.log(polid);


       
            connection.query("UPDATE pubcomplaint SET status = ? WHERE c_id=? ;",[status,cid],function(err,results){
                if(err)
                throw err;
               else{
                   console.log("d");
               }
            })
        if(fin){
            connection.query("UPDATE pubcomplaint SET fin_date = ? WHERE c_id=? ;",[fin,cid],function(err,results){
                if(err)
                throw err;
               else{
                   console.log("d");
               }
            })
        }
       
         
            
            
    
   

connection.query("select rev_id,public_id from pubcomplaint where c_id=?",cid,function(err,results){
    if(err)
    throw err;
   else{
      
        var dat=JSON.parse(JSON.stringify(results));
        console.log(dat);
        console.log(dat[0].public_id);
        connection.query("select public_email from publiclogin where public_id=?",dat[0].public_id,function(err,res){
            if(err) throw err;
            var d=JSON.parse(JSON.stringify(res));
             var email=d[0].public_email;
             console.log(email);
             connection.query("select rev_email,rev_pass from revenuedept where rev_id=?",dat[0].rev_id,function(error,resul){
                if(error) throw error;
                var da=JSON.parse(JSON.stringify(resul));
                var revema=da[0].rev_email;
                var revpass=da[0].rev_pass;
                console.log(revema);
                console.log(revpass);


                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: revema,
                      pass: revpass
                    }
                  });
                  
                  var mailOptions = {
                    // from: 'shannub18@gmail.com',
                    from: revema,
                    to: email,
                    subject: 'Mail from Public Grievance portal',
                    text: 'your status of complaint updated'
                  };
                  
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });

             })
           
        })
   }

})



})


app.post("/Women.html",function(req,res){
  
    
    console.log("efgb");
    var status=req.body.status;
    console.log(status);
   var cid=Number(req.body.cid);
   console.log(cid);
   var polid=Number(req.body.pol);
//    var polid=Number(req.body.cid);
   console.log(polid);


connection.query("SELECT * FROM publiclogin INNER JOIN pubcomplaint ON pubcomplaint.public_id=publiclogin.public_id where c_dept='women' and c_id=? order by c_id desc;",cid,function(err,results){
    if(err)
        throw err;
    else{
       
             
               console.log(results.length);
                data=JSON.parse(JSON.stringify(results));
              
                connection.query("SELECT * FROM messages WHERE cid=? order by id ;",cid,function(err,result){
                    if(err)
                        throw err;
                    else{
                       
                             
                               console.log(result.length);
                                data1=JSON.parse(JSON.stringify(result));
                               console.log(data1.length);
                               res.render("womdetcomp",{sampleData:data,Data:data1});
                              
                            }
                        })
                       
              
              
            }
        })



   

})

app.post("/women",function(req,res){
  
    
    console.log("efgb");
    var status=req.body.status;
    console.log(status);
   var cid=Number(req.body.cid);
   var fin=req.body.findate;
   console.log(cid);
   var polid=Number(req.body.pol);
//    var polid=Number(req.body.cid);
//    console.log(polid);


       
            connection.query("UPDATE pubcomplaint SET status = ? WHERE c_id=? ;",[status,cid],function(err,results){
                if(err)
                throw err;
               else{
                   console.log("d");
               }
            })
        if(fin){
            connection.query("UPDATE pubcomplaint SET fin_date = ? WHERE c_id=? ;",[fin,cid],function(err,results){
                if(err)
                throw err;
               else{
                   console.log("d");
               }
            })
        }
       
         
            
            
    
   

connection.query("select women_id,public_id from pubcomplaint where c_id=?",cid,function(err,results){
    if(err)
    throw err;
   else{
      
        var dat=JSON.parse(JSON.stringify(results));
        console.log(dat);
        console.log(dat[0].public_id);
        connection.query("select public_email from publiclogin where public_id=?",dat[0].public_id,function(err,res){
            if(err) throw err;
            var d=JSON.parse(JSON.stringify(res));
             var email=d[0].public_email;
             console.log(email);
             connection.query("select women_email,women_pass from womendept where women_id=?",dat[0].women_id,function(error,resul){
                if(error) throw error;
                var da=JSON.parse(JSON.stringify(resul));
                var womenema=da[0].women_email;
                var womenpass=da[0].women_pass;
                console.log(womenema);
                console.log(womenema);


                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: womenema,
                      pass: womenpass
                    }
                  });
                  
                  var mailOptions = {
                    // from: 'shannub18@gmail.com',
                    from: womenema,
                    to: email,
                    subject: 'Mail from Public Grievance portal',
                    text: 'Your status of complaint is updated'
                  };
                  
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });

             })
           
        })
   }

})



})

app.post("/polstatus.html",function(req,res){
    var cid=req.body.cid;
   var data;
   var data1;

    connection.query("SELECT * FROM publiclogin INNER JOIN pubcomplaint ON pubcomplaint.public_id=publiclogin.public_id where c_dept='pol' and c_id=? order by c_id desc;",cid,function(err,results){
        if(err)
            throw err;
        else{
           
                 
                   console.log(results.length);
                    data=JSON.parse(JSON.stringify(results));
                  
                    connection.query("SELECT * FROM messages WHERE cid=? order by id ;",cid,function(err,result){
                        if(err)
                            throw err;
                        else{
                           
                                 
                                   console.log(result.length);
                                    data1=JSON.parse(JSON.stringify(result));
                                   console.log(data1.length);
                                   res.render("issue",{sampleData:data,Data:data1});
                                  
                                }
                            })
                           
                  
                  
                }
            })

           
          
          
        })

app.post("/chat.html",function(req,res){
    var msg="OFFICER:"+ req.body.msg;
    console.log(msg);
    var cid=req.body.cid;
    var datetime = new Date();
    VALUES=[
        [cid,msg, new Date()]
    ]
    connection.query("select * from messages where cid=? and content=?",[cid,msg],function(err,results){
        if(err)
            throw err;
        else{
           if(results.length>=1)
           {
            console.log("exists");
           }
           else{
            connection.query("INSERT INTO messages(cid, content, timestamp) Values ?",[VALUES],function(err,results){
                if(err)
                    throw err;
                else{
                   console.log("sent");
                   

                   
                  
                }
            })
           }
          
        }
    })
    
   
    
})

app.post("/chatpub.html",function(req,res){
    var msg= "PUBLIC: " +req.body.msg;
    console.log(msg);
    console.log(msg);
    var cid=req.body.cid;
    var datetime = new Date();
    VALUES=[
        [cid,msg, new Date()]
    ]
    connection.query("select * from messages where cid=? and content=?",[cid,msg],function(err,results){
        if(err)
            throw err;
        else{
           if(results.length>=1)
           {
            console.log("exists");
           }
           else{
            connection.query("INSERT INTO messages(cid, content, timestamp) Values ?",[VALUES],function(err,results){
                if(err)
                    throw err;
                else{
                   console.log("sent");
                  
                }
            })
           }
          
        }
    })
    
   
    
})

app.get("/RaiseIssue.html",function(req,res){
    res.sendFile(__dirname + "/RaiseIssue.html");
})

app.post("/raise",function(req,res){
   var id=req.body.pubcid;
   var comp=req.body.comp;
   console.log(comp);
   values=[
    [id,comp]
   ]
   connection.query("insert into raisecomplaint(c_id,highcomplaint) Values ?",[values],function(err,results){
    if(err) throw err;
    else{
        console.log("sent to high");
    }
   })
   res.redirect("/public.html");
})

app.post("/polsearch",function(req,res){
    var id=req.body.asid;
    connection.query("SELECT * FROM  pubcomplaint INNER JOIN publiclogin on publiclogin.public_id = pubcomplaint.public_id where c_dept='pol' and asspol_id=? order by c_id desc;",id,function(err,results){
        if(err)
            throw err;
        else{
           
                 
                   console.log(results.length);
                    data1=JSON.parse(JSON.stringify(results));
                    connection.query("select status,COUNT(c_id) AS c from pubcomplaint  where c_dept='pol' and asspol_id=? group by status ",id,function(err,result){
                        if(err)
                           throw err;
                        else{
                            var arr=[];
                            var s=0,us=0,n=0,ip=0,t=0;
                            console.log(result.length);
                           var data=JSON.parse(JSON.stringify(result));
                           console.log(data);
                           
                           for(var i=0;i<result.length;i++){
                            console.log(data[i].status);
                                if(data[i].status==='solved'){
                                    s=data[i].c;
                                }
                                else if(data[i].status==='inProgress'){
                                    ip=data[i].c;
                                }
                                else if(data[i].status===null){
                                    n=data[i].c;
                                }
                                else if(data[i].status==="willBeStartedSoon"){
                                    us=data[i].c;
                                }
                           }
                        //    t=s+us+n+ip;
                           arr.push(s);
                           arr.push(us);
                           arr.push(n);
                           arr.push(ip);
                        //    arr.push(t);
                           console.log(arr);
            
                           res.render('sort',{a:arr,sampleData:data1,aid:id});
            
                        }
                      })
            
                  
                  
                    
                                  
                               
                  
                  
                }
            })
})


app.post("/munsearch",function(req,res){
    var id=req.body.asid;
    connection.query("SELECT * FROM  pubcomplaint INNER JOIN publiclogin on publiclogin.public_id = pubcomplaint.public_id where c_dept='mun' and assmun_id=?  order by c_id desc;",id,function(err,results){
        if(err)
            throw err;
        else{
           
                 
                   console.log(results.length);
                    var data1=JSON.parse(JSON.stringify(results));
                    connection.query("select status,COUNT(c_id) AS c from pubcomplaint  where c_dept='mun' and assmun_id=? group by status ",id,function(err,result){
                        if(err)
                           throw err;
                        else{
                            var arr=[];
                            var s=0,us=0,n=0,ip=0,t=0;
                            console.log(result.length);
                           var data=JSON.parse(JSON.stringify(result));
                           console.log(data);
                           
                           for(var i=0;i<result.length;i++){
                            console.log(data[i].status);
                                if(data[i].status==='solved'){
                                    s=data[i].c;
                                }
                                else if(data[i].status==='inProgress'){
                                    ip=data[i].c;
                                }
                                else if(data[i].status===null){
                                    n=data[i].c;
                                }
                                else if(data[i].status==="willBeStartedSoon"){
                                    us=data[i].c;
                                }
                           }
                        //    t=s+us+n+ip;
                           arr.push(s);
                           arr.push(us);
                           arr.push(n);
                           arr.push(ip);
                        //    arr.push(t);
                           console.log(arr);
            
                           res.render('sortmun',{a:arr,sampleData:data1,aid:id});
            
                        }
                      })
            
                  
                  
                    
                                  
                               
                  
                  
                }
            })
})


app.post("/revsearch",function(req,res){
    var id=req.body.asid;
    connection.query("SELECT * FROM  pubcomplaint INNER JOIN publiclogin on publiclogin.public_id = pubcomplaint.public_id  where c_dept='rev' and assrev_id=? order by c_id desc;",id,function(err,results){
        if(err)
            throw err;
        else{
           
                 
                   console.log(results.length);
                    var data1=JSON.parse(JSON.stringify(results));
                    connection.query("select status,COUNT(c_id) AS c from pubcomplaint  where c_dept='rev' and assrev_id=? group by status ",id,function(err,result){
                        if(err)
                           throw err;
                        else{
                            var arr=[];
                            var s=0,us=0,n=0,ip=0,t=0;
                            console.log(result.length);
                           var data=JSON.parse(JSON.stringify(result));
                           console.log(data);
                           
                           for(var i=0;i<result.length;i++){
                            console.log(data[i].status);
                                if(data[i].status==='solved'){
                                    s=data[i].c;
                                }
                                else if(data[i].status==='inProgress'){
                                    ip=data[i].c;
                                }
                                else if(data[i].status===null){
                                    n=data[i].c;
                                }
                                else if(data[i].status==="willBeStartedSoon"){
                                    us=data[i].c;
                                }
                           }
                        //    t=s+us+n+ip;
                           arr.push(s);
                           arr.push(us);
                           arr.push(n);
                           arr.push(ip);
                        //    arr.push(t);
                           console.log(arr);
            
                           res.render('sortrev',{a:arr,sampleData:data1,aid:id});
            
                        }
                      })
            
                  
                  
                    
                                  
                               
                  
                  
                }
            })
})


app.post("/womsearch",function(req,res){
    var id=req.body.asid;
    connection.query("SELECT * FROM  pubcomplaint INNER JOIN publiclogin on publiclogin.public_id = pubcomplaint.public_id  where c_dept='women' and asswom_id=? order by c_id desc;",id,function(err,results){
        if(err)
            throw err;
        else{
           
                 
                   console.log(results.length);
                    var data1=JSON.parse(JSON.stringify(results));
                    connection.query("select status,COUNT(c_id) AS c from pubcomplaint  where c_dept='women' and asswom_id=? group by status ",id,function(err,result){
                        if(err)
                           throw err;
                        else{
                            var arr=[];
                            var s=0,us=0,n=0,ip=0,t=0;
                            console.log(result.length);
                           var data=JSON.parse(JSON.stringify(result));
                           console.log(data);
                           
                           for(var i=0;i<result.length;i++){
                            console.log(data[i].status);
                                if(data[i].status==='solved'){
                                    s=data[i].c;
                                }
                                else if(data[i].status==='inProgress'){
                                    ip=data[i].c;
                                }
                                else if(data[i].status===null){
                                    n=data[i].c;
                                }
                                else if(data[i].status==="willBeStartedSoon"){
                                    us=data[i].c;
                                }
                           }
                        //    t=s+us+n+ip;
                           arr.push(s);
                           arr.push(us);
                           arr.push(n);
                           arr.push(ip);
                        //    arr.push(t);
                           console.log(arr);
            
                           res.render('sortwom',{a:arr,sampleData:data1,aid:id});
            
                        }
                      })
            
                  
                  
                    
                                  
                               
                  
                  
                }
            })
})

app.get("/highauth.html",function(req,res){
    res.sendFile(__dirname+"/highauthlogin.html");
})

app.post("/highauth.html",function(req,res){
   var code=req.body.haid;
   var dept=req.body.dept;
   console.log(dept+"sdxfcgvbhnj");
   connection.query("select deptcode from higherAuthorities where dept=?",dept,function(err,result){
    if(err)throw err;
    else{
        var data=JSON.parse(JSON.stringify(result));
        if(code==data[0].deptcode){
            console.log(data[0].deptcode);
            console.log(dept);

   

    connection.query("select status,COUNT(c_id) AS c from pubcomplaint INNER JOIN publiclogin ON pubcomplaint.public_id=publiclogin.public_id where pubcomplaint.c_dept=?  group by status ",dept,function(err,result){
        if(err)
           throw err;
        else{
            var arr=[];
            var s=0,us=0,n=0,ip=0,t=0;
            console.log(result.length);
           var data=JSON.parse(JSON.stringify(result));
           console.log(data);
           
           for(var i=0;i<result.length;i++){
            console.log(data[i].status);
                if(data[i].status==='solved'){
                    s=data[i].c;
                }
                else if(data[i].status==='inProgress'){
                    ip=data[i].c;
                }
                else if(data[i].status===null){
                    n=data[i].c;
                }
                else if(data[i].status==="willBeStartedSoon"){
                    us=data[i].c;
                }
           }
       
           arr.push(s);
           arr.push(us);
           arr.push(n);
           arr.push(ip);
        
           console.log(arr);
          
           console.log(dept);
           connection.query("select * from raisecomplaint INNER JOIN pubcomplaint on raisecomplaint.c_id = pubcomplaint.c_id where c_dept=?",[dept],function(err,resu){
                        if(err)throw err;
                        else{
                             var data1=JSON.parse(JSON.stringify(resu));
                             console.log(data1);
                           
                            
                              res.render('highauth',{a:arr,sampleData:data1});
                            
                        }
           })
           
           
        }

        
      })
     
   }
}

})
})

app.post("/high.html",function(req,res){
         var cid=req.body.cid;
         connection.query("SELECT * FROM messages WHERE cid=? order by id ;",cid,function(err,result){
            if(err)
                throw err;
            else{

                
               
                     
                       console.log(result.length);
                        data1=JSON.parse(JSON.stringify(result));
                       console.log(data1.length);
                       
                       connection.query("select asspol_id,pol_id,c_dept from pubcomplaint where c_id=?",cid,function(err,results){
                        data=JSON.parse(JSON.stringify(results));
                         var pid=data[0].asspol_id;
                         var pid1=data[0].pol_id;
                         var depart=data[0].c_dept;
                        res.render("highsee",{Data:data1,c:cid,p:pid1,dep:depart});
                       })
                      


                   


                      
                    }
                })

})

app.post("/hamail",function(req,res){
    var pid=req.body.pid;
    var cid=req.body.cid;
  
    connection.query("select c_dept,pol_id,rev_id,mun_id,women_id from pubcomplaint where c_id=?",cid,function(err,results){
        if(err)throw err;
        else{
            var data=JSON.parse(JSON.stringify(results));
            var dept=data[0].c_dept;
            var pol=data[0].pol_id;
            var rev=data[0].rev_id;
            var mun=data[0].mun_id;
            var wom=data[0].women_id;
            if(dept=='pol'){

                var asspol;
    connection.query("select asspol_id from pubcomplaint where c_id=?",cid,function(err,results){
        var data=JSON.parse(JSON.stringify(results));
        asspol=data[0].asspol_id;
    })
       
    connection.query("select pol_email,pol_pass from policedept where polst_id=?",pid,function(err,results){
        var data=JSON.parse(JSON.stringify(results));
        polstemail=data[0].pol_email;
       
        polstpass=data[0].pol_pass;
        console.log(polstemail);
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'shannub18@gmail.com',
              pass: 'fqygckhkfnacllub'
            }


          });
          
          var mailOptions = {
            
            from:'shannub18@gmail.com',
            to: polstemail,
            subject: 'Mail from Public Grievance portal',
            text: 'Convey the police officer with pid'+asspol+'to come to my office by this week'
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
         

    })
                
            }



           else if(dept=='rev'){

                var asspol;
    connection.query("select assrev_id from pubcomplaint where c_id=?",cid,function(err,results){
        var data=JSON.parse(JSON.stringify(results));
        asspol=data[0].assrev_id;
    })
       
    connection.query("select rev_email,rev_pass from revenuedept where rev_id=?",pid,function(err,results){
        var data=JSON.parse(JSON.stringify(results));
        polstemail=data[0].rev_email;
       
        polstpass=data[0].rev_pass;
        console.log(polstemail);
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'shannub18@gmail.com',
              pass: 'fqygckhkfnacllub'
            }


          });
          
          var mailOptions = {
           
            from:'shannub18@gmail.com',
            to: polstemail,
            subject: 'Mail from Public Grievance portal',
            text: 'Convey the revenue officer with pid'+asspol+'to come to my office by this week'
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
         

    })
                
            }


            else if(dept=='mun'){

                var asspol;
    connection.query("select assmun_id from pubcomplaint where c_id=?",cid,function(err,results){
        var data=JSON.parse(JSON.stringify(results));
        asspol=data[0].assmun_id;
    })
       
    connection.query("select mun_email,mun_pass from muncipaldept where munst_id=?",pid,function(err,results){
        var data=JSON.parse(JSON.stringify(results));
        polstemail=data[0].mun_email;
       
        polstpass=data[0].mun_pass;
        console.log(polstemail);
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'shannub18@gmail.com',
              pass: 'fqygckhkfnacllub'
            }


          });
          
          var mailOptions = {
           
            from:'shannub18@gmail.com',
            to: polstemail,
            subject: 'Mail from Public Grievance portal',
            text: 'Convey the muncipal officer with pid'+asspol+'to come to my office by this week'
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
         

    })
                
            }

            else if(dept=='women'){

                var asspol;
    connection.query("select asswom_id from pubcomplaint where c_id=?",cid,function(err,results){
        var data=JSON.parse(JSON.stringify(results));
        asspol=data[0].assmun_id;
    })
       
    connection.query("select women_email,women_pass from womendept where women_id=?",pid,function(err,results){
        var data=JSON.parse(JSON.stringify(results));
        polstemail=data[0].women_email;
       
        polstpass=data[0].women_pass;
        console.log(polstemail);
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'shannub18@gmail.com',
              pass: 'fqygckhkfnacllub'
            }


          });
          
          var mailOptions = {
            
            from:'shannub18@gmail.com',
            to: polstemail,
            subject: 'Mail from Public Grievance portal',
            text: 'Convey the women officer with pid'+asspol+'to come to my office by this week'
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
         

    })
                
            }

    

        }
    })

    connection.query("select public_email from publiclogin INNER JOIN pubcomplaint on publiclogin.public_id=pubcomplaint.public_id where c_id=?",cid,function(err,results){
        var data=JSON.parse(JSON.stringify(results));
        email=data[0].public_email;
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'shannub18@gmail.com',
              pass: 'fqygckhkfnacllub'
            }


          });
          
          var mailOptions = {
            // from: 'shannub18@gmail.com',
            from:'shannub18@gmail.com',
            to: email,
            subject: 'Mail from Public Grievance portal',
            text: 'You have missconception..The officer is correct'
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        
    })

    res.redirect("/Departments.html");

      
 })

app.get("/askquestion.html",function(req,res){
    res.sendFile(__dirname+"/askquelogin.html")
})

app.post("/askquelogin.html",function(req,res){
    var rid=req.body.regid;
    connection.query("SELECT * FROM askquestions WHERE rid=? order by id",rid,function(err,result){
        if(err)
            throw err;
        else{
           
                 
                   console.log(result.length);
                   var data1=JSON.parse(JSON.stringify(result));
                   console.log(data1.length);
                   res.render("askque",{Data:data1,rid:rid});
                  
                }
            })
    
})

app.post("/askpub.html",function(req,res){
    var msg= "PUBLIC: " +req.body.msg;
    console.log(msg);
    console.log(msg);
    var rid=req.body.rid;
    var datetime = new Date();
    VALUES=[
        [rid,msg, new Date(),"no"]
    ]
    connection.query("select * from askquestions where rid=? and content=?",[rid,msg],function(err,results){
        if(err)
            throw err;
        else{
           if(results.length>=1)
           {
            console.log("exists");
           }
           else{
            connection.query("INSERT INTO askquestions(rid, content, timestamp,mark) Values ?",[VALUES],function(err,results){
                if(err)
                    throw err;
                else{
                   console.log("sent");
                  
                }
            })
           }
          
        }
    })
    
   
    
})

app.get("/mglogin.html",function(req,res){
    res.sendFile(__dirname+"/MGlogin.html")
})

app.post("/mglogin.html",function(req,res){
    var mgid=req.body.mgid;
    if(mgid==123456){
    connection.query("SELECT distinct(rid) FROM askquestions where mark='no'",function(err,result){
        if(err)
            throw err;
        else{
           
                 
                   console.log(result.length);
                   var data1=JSON.parse(JSON.stringify(result));
                   console.log(data1.length);
                   res.render("mgview",{sampleData:data1});
                  
                }
            })
        }
})

app.post("/mgchat.html",function(req,res){
    var rid=req.body.rid;
    connection.query("SELECT * FROM askquestions WHERE rid=? order by id",rid,function(err,result){
        if(err)
            throw err;
        else{
           
                 
                   console.log(result.length);
                   var data1=JSON.parse(JSON.stringify(result));
                   console.log(data1.length);
                   res.render("mgchat",{Data:data1,rid:rid});
                  
                }
            })

})

app.post("/mgchat",function(req,res){
    var msg= "OFFICER: " +req.body.msg;
    console.log(msg);
    console.log(msg);
    var rid=req.body.rid;
    var datetime = new Date();
    VALUES=[
        [rid,msg, new Date(),"yes"]
    ]
    connection.query("select * from askquestions where rid=? and content=?",[rid,msg],function(err,results){
        if(err)
            throw err;
        else{
           if(results.length>=1)
           {
            console.log("exists");
           }
           else{
            connection.query("INSERT INTO askquestions(rid, content, timestamp,mark) Values ?",[VALUES],function(err,results){
                if(err)
                    throw err;
                else{
                   console.log("sent");
                   connection.query("Update askquestions set mark='yes' where rid=? ",rid,function(err,resu){
                    if(err) throw err;
                    else{
                        console.log("set yes");
                    }
                   })

                  
                }
            })

           }
          
        }
    })
})


app.post("/hamailtopub",function(req,res){
    cid=req.body.cid;
    connection.query("select public_email from publiclogin INNER JOIN pubcomplaint on publiclogin.public_id=pubcomplaint.public_id where c_id=?",cid,function(err,results){
        var data=JSON.parse(JSON.stringify(results));
        email=data[0].public_email;
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'shannub18@gmail.com',
              pass: 'fqygckhkfnacllub'
            }


          });
          
          var mailOptions = {
          
            from:'shannub18@gmail.com',
            to: email,
            subject: 'Mail from Public Grievance portal',
            text: 'You have missconception..The officer is correct'
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        
    })
    res.redirect("/Departments.html");
})