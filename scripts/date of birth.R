#import data dbf ke data.frame R
library("foreign")
dbf_path <- if (file.exists("data/raw/umat.dbf")) {
  "data/raw/umat.dbf"
} else if (file.exists("../data/raw/umat.dbf")) {
  "../data/raw/umat.dbf"
} else {
  "umat.dbf"
}
data = read.dbf(dbf_path)

#ubah nama kolom di dataframe (http://rprogramming.net/rename-columns-in-r/)
colnames(dob)[colnames(dob)=="TGLLAHIR"] <- "tgllahir"

#cari umur dari kolom tanggal lahir (format : date)
dob <- data %>%
  dplyr::select(TGLLAHIR, KET1) %>%
  mutate(age = floor(((Sys.Date() - TGLLAHIR)/365.25)))

#buat display barchart untuk golongan darah
ggplot(data = gol_darah) +
  geom_bar(mapping = aes(x = KET7, fill = KET7))

#cari banyak data per golongan umur
dob_2 <- dob %>%
  group_by(umur) %>%
  summarise(
    count = n())

dob_3 <- dob %>%
  count(umur)

#cek klo data count group_by kita dah bener
sum(dob_2$count)

#buat historgram tp koordinat dibalik
ggplot(data = dob) +
   geom_histogram(mapping = aes(x = umur), binwidth = 10)+
   coord_flip()

#cek interval yg dibuat histogram 
dob %>%
   count(cut_width(umur, 10))

#cari data GBM
padokan <- data %>%
  dplyr::select(WILAYAH,NMWILAYAH,LINGKUNGAN,NMLINGKUNG,NAMA)

#ambil wilayah2 yg masuk GBM
gbm2 <- filter(data, WILAYAH == 30006010 | WILAYAH == 30006011 | WILAYAH == 30006012 | WILAYAH == 30006015 | WILAYAH == 30006018)

#convert to xlsx
library(xlsx)
write.xlsx(gbm2, file = 'd:/data_gbm.xlsx')

 dob2 <- dob %>%
  group_by(KET1, age) %>%
  count(KET1, age)

#cara buat piramid penduduk
 set.seed(1)
 df0 <- data.frame(Age = factor(rep(x = 1:10, times = 2)), 
                   Gender = rep(x = c("Female", "Male"), each = 10),
                   Population = sample(x = 1:100, size = 20))
 library(ggplot2)
 ggplot(data = df0, 
        mapping = aes(x = Age, fill = Gender, 
                      y = ifelse(test = Gender == "Male", 
                                 yes = -Population, no = Population))) +
   geom_bar(stat = "identity") +
   scale_y_continuous(labels = abs, limits = max(df0$Population) * c(-1,1)) +
   labs(y = "Population") +
   coord_flip()
 
 #pilih kolom2 yg diperlukan utk hitung umur
 dob_pugeran <- agama %>%
  dplyr::select(NAMA, TGLLAHIR, KET1) %>%
  mutate(age = as.numeric(floor(((Sys.Date() - TGLLAHIR)/365.25))))

  #hilangkan data dengan missing values
 dob_pugeran <- na.omit(dob_pugeran)

  #ubah nama2 column names
 colnames(dob_pugeran)[colnames(dob_pugeran)=="TGLLAHIR"] <- "tgllahir"
 colnames(dob_pugeran)[colnames(dob_pugeran)=="KET1"] <- "kelamin"
 colnames(dob_pugeran)[colnames(dob_pugeran)=="age"] <- "umur"

  #hitung jumlah orang dengan umur x di jenis kelamin y
 dob_pugeran_2 <- dob_pugeran %>%
   group_by(kelamin, umur) %>%
   count(kelamin,umur)
 ggplot(data = dob_pugeran_2, 
  mapping = aes(x = umur, fill = kelamin, 
   y = ifelse(test = kelamin == "L", yes = -n, no = n))) +
  geom_bar(stat = "identity") +
  scale_y_continuous(labels = abs, limits = max(dob_pugeran_2$n) * c(-1,1)) +
  labs(y = "Population") +
  coord_flip()
 

 
 
 
 #buat golongan umur
dob_pugeran_3 <- dob_pugeran%>%
   mutate(gol_umur = case_when(umur >= 90 ~ "90+",
                               umur >= 85 ~ "85-89",
                               umur >= 80 ~ "80-84",
                               umur >= 75 ~ "75-79",
                               umur >= 70 ~ "70-74",
                               umur >= 65 ~ "65-69",
                               umur >= 60 ~ "60-64",
                               umur >= 55 ~ "55-59",
                               umur >= 50 ~ "50-54",
                               umur >= 45 ~ "45-49",
                               umur >= 40 ~ "40-44",
                               umur >= 35 ~ "35-39",
                               umur >= 30 ~ "30-34",
                               umur >= 25 ~ "25-29",
                               umur >= 20 ~ "20-24",
                               umur >= 15 ~ "15-19",
                               umur >= 10 ~ "10-14",
                               umur >= 5 ~ "05-09",
                               TRUE ~ "00-04"))
dob_pugeran_2 <- dob_pugeran_3 %>%
  select(`Jenis Kelamin`= kelamin, gol_umur) %>%
  group_by(`Jenis Kelamin`, gol_umur) %>%
  count(`Jenis Kelamin`,gol_umur)

#buat pyramid graph berdasarkan golongan umur
bar_pyramid <- ggplot(data = dob_pugeran_2, 
       mapping = aes(x = gol_umur, fill = `Jenis Kelamin`, 
                     y = ifelse(test = `Jenis Kelamin` == "L", yes = -n, no = n))) +
  geom_bar(stat = "identity") +
  geom_text(aes(label = n)) +
  scale_y_continuous(labels = abs, limits = max(dob_pugeran_2$n) * c(-1,1)) +
  labs(x = "Umur", y = "Jumlah Umat") +
  scale_fill_manual("Jenis Kelamin", values = c("L" = "#8B0000", "P" = "#FFA07A"))+
  coord_flip()





 #buat grafik coord dengan jumlah umat per wilayah
jml_wilayah <- as.data.frame(summary(data$NMWILAYAH))
colnames(jml_wilayah)[colnames(jml_wilayah)=="summary(data$NMWILAYAH)"] <- "n"
jml_wilayah <- jml_wilayah %>%
  tibble::rownames_to_column("NMWILAYAH")

bar <- ggplot(jml_wilayah) +
   geom_col(mapping = aes(x = reorder(NMWILAYAH, n), y = n, fill = n)) +
   geom_text(aes(x = reorder(NMWILAYAH, n), y = n, label = n)) +
   scale_fill_gradient(low = "#FFE2E2", high="#8B0000")
bar + coord_polar()

#tanpa order
bar <- ggplot(jml_wilayah) +
  geom_col(mapping = aes(x = NMWILAYAH, y = n, fill = n)) +
  geom_text(aes(x = NMWILAYAH, y = n, label = n)) +
  scale_fill_gradient(low = "#FFE2E2", high="#8B0000")
bar + coord_polar()

 jadi <- bar +
  labs(x = "Nama Wilayah", y = "Jumlah Umat")+
  coord_polar() +
  theme_minimal()+
  ggtitle("Grafik Jumlah Umat Paroki Pugeran berdasarkan Wilayah", subtitle = "data: Januari 2017") 
  #theme(axis.text.x = element_text(angle=-20)) 
 
 
 #UNTUK LIHAT DATA UMU
 #pilih kolom2 yg diperlukan utk hitung umur
 data_pemilu <- agama %>%
   dplyr::select(WILAYAH,LINGKUNGAN,NMWILAYAH,NMLINGKUNG,NAMA,KET1,TGLLAHIR) %>%
   mutate(age = as.numeric(floor(((Sys.Date() - TGLLAHIR)/365.25)))) %>%
   filter(age >= 17)
 
 #hilangkan data dengan missing values
 data_pemilu_1 <- na.omit(data_pemilu)
 