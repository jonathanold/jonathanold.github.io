# IV Section
setwd("/Users/jonathanold/Library/CloudStorage/GoogleDrive-jonathan_old@berkeley.edu/My Drive/_Berkeley Teaching/Econ 140-S2023/Section IV/")
library("ivreg")
gas = read.csv("gasoline.csv")

# 1.a
reg1 = lm(quantgas ~ pricegas, data=gas)
summary(reg1)

# 1.b
p = mean(gas$pricegas)
q = reg$coefficients[1]+p*reg$coefficients[2]
dqdp = reg$coefficients[2]

elasticity = round(dqdp*p/q,3)
print(paste0("The price elasticity of gas is ", elasticity))

# 1.c
reg2 = lm(quantgas ~ pricegas + persincome, data=gas)
summary(reg2)

# 1.d: OVB

# 1.e: OVB

# 1.f: First stage
reg_fs = lm(pricegas ~ carsales + persincome  , data=gas)
reg_fs2 = summary(reg_fs)

Fstat = (reg_fs2$coefficients[2,3])^2
Fstat

# 1.h: 
reg_iv = ivreg(quantgas ~ pricegas + persincome | carsales + persincome  , data=gas)
summary(reg_iv)



# 1.j: 
reg_iv2 = ivreg(quantgas ~ pricegas + persincome | transindex + persincome  , data=gas)
summary(reg_iv2)


