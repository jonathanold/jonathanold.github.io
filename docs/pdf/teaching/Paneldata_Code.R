library("dplyr")
library("plm")
library('huxtable')
library('showtext')
library('jtools')


# Read in Data
welfare_data <- read.csv("welfare.csv")
head(welfare_data)


# OLS regression: employed on reform
reg_b1 <- lm(employed ~ reform, data=welfare_data)
a = summary(reg_b1)
a

# OLS regression (2): With controls
reg_b2 <- lm(employed ~ reform + white + woman + avg_benefit, data=welfare_data)
b = summary(reg_b2)
b


# Include state dummies.
# Note that we cannot estimate the effect of avg_benefit because it is constant across states
reg_d <- lm(employed ~ reform + white + woman + factor(state) +  avg_benefit , data=welfare_data)
d = summary(reg_d)
d



# Estimate with differencing
# Take means by state
means = welfare_data %>%
  group_by(state) %>%
  summarise(state, year, employed=mean(employed), reform=mean(reform), white=mean(white), woman=mean(woman))

# Take differences between variables and their state-level mean
demployed = as.numeric(welfare_data$employed-means$employed)
dreform = as.numeric(welfare_data$reform-means$reform)
dwhite = as.numeric(welfare_data$white-means$white)
dwoman = as.numeric(welfare_data$woman-means$woman)

# Collect in matrix
differences = as.data.frame(as.matrix(cbind(means$state, means$year, demployed, dreform, dwhite, dwoman), ncol=6))
differences$dreform = as.numeric(differences$dreform)
differences$dwhite = as.numeric(differences$dwhite)
differences$dwoman = as.numeric(differences$dwoman)
differences$demployed = as.numeric(differences$demployed)

# Run regression of differenced date: The coefficients are exactly the same and the intercept is 0
reg_e <- lm(demployed ~ dreform + dwoman + dwhite , data=differences)
summary(reg_e)



# We can also estimate with PLM
install.packages("plm")
library("plm")
reg_e = plm(employed ~ reform + white + woman, data=welfare_data,
            effect="individual", index=c("state", "year"), model="within")
e = summary(reg_e)

export_summs(a, b, reg_e)



# Using time FE
reg_f = plm(employed ~ reform + white + woman, data=welfare_data,
            effect="time", index=c("state", "year"), model="within")
f = summary(reg_f)
f 

# Using time and state FE
reg_g = plm(employed ~ reform + white + woman, data=welfare_data, 
            effect = "twoways", index=c("state", "year"), model="within")
g = summary(reg_g)
g

export_summs(b, reg_e, reg_f, reg_g)